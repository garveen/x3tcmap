<?php
class Parser
{

    public $pageIds = [7, 1000, 17, 195, 1266, 35, 1903, 1906, 1951];

    // public $objectTypes => [
    //     '18'
    // ]
    public $translation = [];
    public $objects = [];

    public $files = [
        'factories' => [
            'type' => 28,
            'props' => [
                'id' => 6,
                'icon' => 18,
            ],
        ],
        'gates' => [
            'type' => 17,
            'props' => [
                'id' => 6,
            ],
        ],
        'docks' => [
            'type' => 27,
            'props' => [
                'id' => 6,
                'icon' => 17,
            ],
        ],
        'asteroids' => [
            'type' => 20,
            'props' => [
                'id' => 6,
            ],
            'addition' => [
                'icon' => 'ICON_TRG_ASTEROID',
            ],
        ],
        'icons' => [
            'type' => 0,
            'props' => [
                'l' => 2,
                't' => 3,
                'w' => 4,
                'h' => 5,
            ],
        ],
    ];

    public $typeMap = [
        17 => [
            0 => 'SS_ASTEROID_01',
            1 => 'SS_ASTEROID_02',
            2 => 'SS_ASTEROID_03',
            3 => 'SS_ASTEROID_04',
            4 => 'SS_ASTEROID_05',
            5 => 'SS_ASTEROID_06',
            6 => 'SS_ASTEROID_07',
            7 => 'SS_ASTEROID_08',
            8 => 'SS_ASTEROID_09',
        ],
        18 => [
            0 => 'SS_WG_NORTH',
            1 => 'SS_WG_SOUTH',
            2 => 'SS_WG_WEST',
            3 => 'SS_WG_EAST',

            5 => 'SS_WG_T_NORTH',
            6 => 'SS_WG_T_SOUTH',
            7 => 'SS_WG_T_WEST',
            8 => 'SS_WG_T_EAST',
        ],
    ];

    public $directionMap = [
        0 => 'N',
        1 => 'S',
        2 => 'W',
        3 => 'E',
    ];

    public static $languageMap = [
        49 => 'German',
        48 => 'Polish',
        44 => 'English',
        42 => 'Czech',
        39 => 'Italian',
        34 => 'Spanish',
        33 => 'French',
        07 => 'Russian',
        86 => 'Simplified Chinese',
        88 => 'Traditional Chinese',
    ];

    public function __construct($langFile = false, $universeXmlFiles = false)
    {
        $this->parseText();
        if ($langFile) {
            $this->parseLanguage($langFile);
            if ($universeXmlFiles) {
                $this->parseUniverse($universeXmlFiles);
            }
        }
    }

    public function translate($pageId, $id)
    {
        if(isset($this->translationUsedMap[$pageId][$id])) {
            return $this->translationUsedMap[$pageId][$id];
        }

        $translation = false;

        if (isset($this->translation[$pageId][$id])) {
            $translation = $this->translation[$pageId][$id];
        }

        if (!$translation) {
            $translation = $id;
        }
        do {
            $translation = preg_replace_callback('~\{\s*(\d+)\s*,\s*(\d+)\s*\}~', function ($matches) use ($pageId) {
                if (isset($this->translation[$matches[1]][$matches[2]])) {
                    return $this->translation[$matches[1]][$matches[2]];
                }
            }, $translation, -1, $count);
        } while ($count);
        $translation = preg_replace('~\(.+\)~', '', $translation);

        $length = count($this->translationUsed);
        $this->translationUsedMap[$pageId][$id] = $length;
        $this->translationUsed[$length] = $translation;
        return $length;

    }

    public function parseLanguage($langFile)
    {
        $this->translation = [];
        $this->translationUsed = [];
        $this->translationUsedMap = [];
        $language = simplexml_load_file($langFile);
        $pages = [];
        foreach ($language->page as $page) {
            $pages[(int) $page['id']] = $page;
        }
        foreach ($this->pageIds as $pageId) {
            foreach (['%d', '30%04d', '35%04d', '38%04d'] as $pattern) {
                $actualPageId = sprintf($pattern, $pageId);
                // var_dump($actualPageId);
                if (isset($pages[$actualPageId])) {
                    foreach ($pages[$actualPageId] as $text) {
                        $this->translation[$pageId][(int) $text['id']] = (string) $text;
                    }
                }
            }
        }

    }

    public function parseText()
    {
        foreach ($this->files as $file => $config) {
            $lines = file("data/{$file}.txt");
            foreach ($lines as $line) {
                $line = explode(';', $line);

                if (!isset($line[$config['type']])) {
                    continue;
                }

                $info = [];
                foreach ($config['props'] as $k => $v) {
                    if (!isset($line[$v])) {
                        continue 2;
                    }
                    $info[$k] = $line[$v];
                }
                if (isset($config['addition'])) {
                    foreach ($config['addition'] as $k => $v) {
                        $info[$k] = $v;
                    }
                }
                $this->objects[$line[$config['type']]] = $info;

            }
        }
    }
    public function parseUniverse($universeXmlFiles)
    {
        // see http://www.xenotaph.net/lib_pdf/galaxy_hacking_x3tc.pdf

        if (!is_array($universeXmlFiles)) {
            $universeXmlFiles = [$universeXmlFiles];
        }
        $sectors = [];
        $iconUsed = [];
        $iconUsedMap = [];
        foreach ($universeXmlFiles as $universeXmlFile) {

            $universe = simplexml_load_file($universeXmlFile);
            $i = 0;

            foreach ($universe as $sectorXml) {
                $x = (int) $sectorXml['x'];
                $y = (int) $sectorXml['y'];
                $langId = sprintf('102%02d%02d', 1 + $y, 1 + $x);
                $gates = [];
                $objects = [];

                $race = (int) $sectorXml['r'];
                $coordinate = "{$x}_{$y}";
                if (!isset($sectors[$coordinate])) {
                    $sectors[$coordinate] = $sector = new Sector($this->translate(7, $langId), $x, $y, $race);
                } else {
                    $sector = $sectors[$coordinate];
                }
                $sector->size = (int) $sectorXml['size'];
                $sector->safety = ((int) $sectorXml['f']) == 0 ? $this->translate(35, 753) : $this->translate(35, 752);

                foreach ($sectorXml as $object) {
                    $mainType = (string) $object['t'];
                    $subType = (string) $object['s'];
                    if (isset($this->typeMap[$mainType][$subType])) {
                        $type = $this->typeMap[$mainType][$subType];
                    } else {
                        $type = $subType;
                    }
                    if (!isset($this->objects[$type])) {
                        continue;
                    }
                    $typeInfo = $this->objects[$type];

                    $objectX = (int) $object['x'];
                    $objectY = (int) $object['y'];
                    $objectZ = (int) $object['z'];

                    switch ($mainType) {
                        case '18':
                            // gates
                            $sector->gates[] = [
                                'x' => $objectX,
                                'y' => $objectY,
                                'z' => $objectZ,
                                'gx' => (int) $object['gx'],
                                'gy' => (int) $object['gy'],
                                'gid' => (int) $object['gid'],
                                's' => (int) $object['s'],
                            ];
                            break;
                        case '17':
                            // asteroids
                        case '5':
                            // (station) trading docks
                        case '6':
                            // (station) factories / shipyards
                        default:
                            $icon = $this->objects[$type]['icon'];
                            if(!isset($iconUsedMap[$icon])) {
                                $length = count($iconUsed);
                                $iconUsedMap[$icon] = $length;
                                $iconUsed[$length] = $this->objects[$icon];
                            }
                            $icon = $iconUsedMap[$icon];
                            $sector->objects[$mainType][$subType][] = [
                                'x' => $objectX,
                                'y' => $objectY,
                                'z' => $objectZ,
                                'icon' => $icon,
                                'name' => $this->translate(17, $typeInfo['id']),
                            ];
                    }
                }
            }

        }
        foreach ($sectors as $sector) {
            $stations = 0;
            if (isset($sector->objects[5])) {
                foreach ($sector->objects[5] as $sub) {
                    $stations += count($sub);
                }
            }
            if (isset($sector->objects[6])) {
                foreach ($sector->objects[6] as $sub) {
                    $stations += count($sub);
                }
            }
            $sector->stations = $stations;
        }
        $this->sectors = $sectors;
        $this->iconUsed = $iconUsed;
    }

}
