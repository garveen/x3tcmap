<?php

class Sector
{
    public $gates = [];
    public $objects = [];
    public $name;
    public $x;
    public $y;
    public $race;
    public function __construct($name, $x, $y, $race)
    {
        $this->name = $name;
        $this->x = $x;
        $this->y = $y;
        $this->race = $race;
    }
}
