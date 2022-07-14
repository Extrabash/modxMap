<?php
/*
* Собираем данные по дилерам в удобном для яндексе виде
* 
* 
*/

/* получить ТВ */
$tv = $modx->getObject('modTemplateVar',array('name'=>'map_migx'));

/* получить сырое содержимое ТВ */
$rawValue = $tv->getValue(582); // тут айди ресурса

// ключи фильтрации
$filterKeys = array('map_country', 'map_city', 'map_dealer_type', 'map_product_type');

// Получим массив с названиями этих фильтров по ключам
$tvs = array();

foreach($filterKeys as $tvKey){
    $tv = $modx->getObject('modTemplateVar',array('name'=>$tvKey));
    $tvs[$tvKey] = $tv->caption;
}
$filterKeys = $tvs;
unset($tvs);

// Основной массив объектов
$array = json_decode($rawValue, false);


// Получим все значения у активных точек
$filtersAll = getFilters($array, $filterKeys);

if(!empty($filtersAll))
    {
        // Получаем данные для печати в снипеет
        //print_r($scriptProperties);
        $tplFilter = $modx->getOption('tplFilter',$scriptProperties,'');
        $tplFilterOption = $modx->getOption('tplFilterOption',$scriptProperties,'');

        if($tplFilter != '')
            if($tplFilterOption != '')
            {
                $outterOutput = '';
                
                foreach ($filtersAll as &$filter)
                {
                    $innerOutput = '';
                    
                    foreach($filter['values'] as $value)
                    {
                        $chunk = $modx->newObject('modChunk');
                        $chunk->setCacheable(false);
                        $chunk->setContent($tplFilterOption);
                        //print_r($value);
                        
                        $innerOutput .= $chunk->process($value);
                    }
                        
                    $filter['wrapper'] = $innerOutput;
                    
                    $chunk = $modx->newObject('modChunk');
                    $chunk->setCacheable(false);
                    $chunk->setContent($tplFilter);
                    
                    $outterOutput .= $chunk->process($filter);
                }
                
                return $outterOutput;
            }
            else
                $modx->log(modX::LOG_LEVEL_ERROR, 'Не передан шаблон для опций фильтров tplFilterOption', '', 'YMapsDealersSnippetFilters');
        else
            $modx->log(modX::LOG_LEVEL_ERROR, 'Не передан шаблон для фильтров tplFilter', '', 'YMapsDealersSnippetFilters');
    }
else
    $modx->log(modX::LOG_LEVEL_ERROR, 'Пустой массив фильтров', '', 'YMapsDealersSnippetFilters');
    

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
    
    $newFilters = array();
    
    foreach($filters as $key => &$filter)
    {
        $filter = array_unique($filter);
        
        $newFilter = array();
        $newFilter['key'] = $key;
        $newFilter['name'] = $filterKeys[$key];
        foreach ($filter as $innerKey => $value)
        {
            $newValue = array();
            $newValue['MIGX_id'] = $innerKey;
            $newValue['key'] = $key;
            $newValue['name'] = $value;
            
            $newFilter['values'][] = $newValue;
        }
        
        $newFilters[] = $newFilter;
    }
    
    return $newFilters;
}
