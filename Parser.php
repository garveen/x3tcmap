<?php
class Parser
{

    public $pageIds = [
        7,
        9,
        12,
        13,
        17,
        35,
        195,
        1000,
        1266,
        1903,
        1906,
        1951,
    ];

    public $translation = [];
    public $objects = [];

    public $files = [
        // http://www.argonopedia.org/wiki/TFactories.txt_(X3)
        'TFactories' => [
            'Tid' => 6,
            'type' => 28,
            'props' => [
                'name' => 6,
                'icon' => 18,
            ],
        ],
        'TGates' => [
            'Tid' => 18,
            'type' => 17,
            'props' => [
                'name' => 6,
            ],
        ],
        // http://www.argonopedia.org/wiki/TDocks.txt_(X3)
        'TDocks' => [
            'Tid' => 5,
            'type' => 27,
            'props' => [
                'name' => 6,
                'icon' => 17,
            ],
        ],
        'TAsteroids' => [
            'Tid' => 17,
            'type' => 20,
            'props' => [
                'name' => 6,
            ],
            'addition' => [
                'icon' => 'ICON_TRG_ASTEROID',
            ],
        ],
        'IconData' => [
            'type' => 0,
            'props' => [
                'l' => 2,
                't' => 3,
                'w' => 4,
                'h' => 5,
            ],
        ],
    ];

    public $typeMap = [];

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

    public function __construct($map, $language)
    {
        $this->parseText($map);
        $files = [];
        foreach (['lang/', "lang/{$map}/"] as $dir) {
            $files = array_merge($files, glob($dir . "*-L0{$language}.xml"));
        }
        $this->parseLanguage($files);

        $this->parseUniverse([
            'maps/x3_universe_2.0.xml',
            "maps/x3{$map}_universe.xml",
        ]);

    }

    public function translate($pageId, $id)
    {
        if (isset($this->translationUsedMap[$pageId][$id])) {
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
                return "!!!{$matches[1]}-{$matches[2]}!!!";
            }, $translation, -1, $count);
        } while ($count);
        if (!$translation) {
            $translation = "!!!{$pageId}-{$id}!!!";
        }
        $translation = preg_replace('~\(.+\)~', '', $translation);

        $length = count($this->translationUsed);
        $this->translationUsedMap[$pageId][$id] = $length;
        $this->translationUsed[$length] = $translation;
        return $length;

    }

    public function parseLanguage($langFiles)
    {
        $this->translation = [];
        $this->translationUsed = [];
        $this->translationUsedMap = [];
        foreach ($langFiles as $langFile) {
            $language = simplexml_load_file($langFile);
            $pages = [];
            foreach ($language->page as $page) {
                $pages[(int) $page['id']] = $page;
            }
            foreach ($this->pageIds as $pageId) {
                foreach (['%d', '30%04d', '35%04d', '38%04d'] as $pattern) {
                    $actualPageId = sprintf($pattern, $pageId);
                    if (isset($pages[$actualPageId])) {
                        foreach ($pages[$actualPageId] as $text) {
                            $this->translation[$pageId][(int) $text['id']] = (string) $text;
                        }
                    }
                }
            }
        }
    }

    public function parseText($map)
    {
        foreach ($this->files as $file => $config) {
            if (!is_file($filename = "data/{$map}/{$file}.txt")) {
                $filename = "data/{$file}.txt";
            }
            $lines = file($filename);
            foreach ($lines as $line) {
                if (strncmp($line, '//', 2) == 0) {
                    continue;
                }
                $line = explode(';', $line);

                if (count($line) < 3) {
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
                if (isset($config['Tid'])) {
                    $this->typeMap[$config['Tid']][] = $line[$config['type']];
                }

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
                            if (!isset($iconUsedMap[$icon])) {
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
                                'name' => $this->translate(17, $typeInfo['name']),
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
