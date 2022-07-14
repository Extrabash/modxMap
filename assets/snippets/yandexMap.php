<?php

/*
* Собираем данные по дилерам в удобном для яндексе виде
* 
* 
*/


// Подключаем
define('MODX_API_MODE', true);
require '/home/a/abashy8f/modxmap.rock-n-scroll.ru/public_html/index.php';

/* получить ТВ */
$tv = $modx->getObject('modTemplateVar',array('name'=>'map_migx'));

/* получить сырое содержимое ТВ */
$rawValue = $tv->getValue(1);

// ключи фильтрации
$filterKeys = array('map_country', 'map_city', 'map_dealer_type', 'map_product_type');
if(!empty($filterKeys))
{
    // Получим массив с названиями этих фильтров по ключам
    $tvs = array();

    foreach($filterKeys as $tvKey){
        $tv = $modx->getObject('modTemplateVar',array('name'=>$tvKey));
        $tvs[$tvKey] = $tv->caption;
    }
   $filterKeys = $tvs;
   unset($tvs);
}


// Основной массив объектов
$array = json_decode($rawValue, false);


// Получим все значения у активных точек
$filtersAll = getFilters($array, $filterKeys);
//print_r($filtersAll);

$jSon = createJsonForYMaps($array);
print($jSon);

function createJsonForYMaps($dealersArray){

    $JObj = new stdClass();
    $JObj->type = "FeatureCollection";    

    foreach($dealersArray as &$dealer)
    {
        // Проверим что эта точка активна
        if($dealer->active)
        {
            $feature = new stdClass();

            $feature->type   = "Feature";
            $feature->id     = $dealer->MIGX_id;

            $feature->geometry->type = "Point";
            $feature->geometry->coordinates = explode(",", $dealer->map_geocode);

            $feature->properties->map_country = $dealer->map_country;
            $feature->properties->map_city = $dealer->map_city;
            $feature->properties->title = $dealer->title;
            $feature->properties->address = $dealer->address;
            //$feature->properties->text = $dealer->text;
            $feature->properties->map_dealer_type = $dealer->map_dealer_type;
            $feature->properties->map_product_type = $dealer->map_product_type;
            //$feature->properties->phone = $dealer->phone;
            //$feature->properties->site = $dealer->site;
            //$feature->properties->email = $dealer->email;
            //$feature->properties->vk = $dealer->vk;
            //$feature->properties->facebook = $dealer->facebook;
            //$feature->properties->telegram = $dealer->telegram;
            //$feature->properties->active = $dealer->active;

            $JObj->features[] = $feature;
        }
    }

    return json_encode($JObj);
}


function getFilters($dealersArray, $filterKeys){

    $filters = array();
    
    foreach($dealersArray as &$dealer){
        foreach($dealer as $key => $value)
        {
            if(in_array($key, array_keys($filterKeys)) && $dealer->active)
                if(!is_array($value))
                    $filters[$key][] = $value;
                else
                    foreach($value as $vV)
                        $filters[$key][] = $vV;
        }
    }
    
    foreach($filters as &$filter)
    {
        $filter = array_unique($filter);
    }
    
    return $filters;
}
