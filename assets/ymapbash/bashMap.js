function getFilterArr(checked = true) {
    var filteredArr = new Object();

    checkStr = "";
    if (checked)
        checkStr = ":checked";


    $('.filter_val [type=checkbox]' + checkStr).each(function () {
        var filter = new Object();

        filter.key = $(this).attr('name');
        filter.id = $(this).attr('id');
        filter.value = $(this).val();

        filter.checked = $(this).prop('checked');
        filter.disabled = $(this).prop('disabled');

        if (typeof filteredArr[filter.key] === 'undefined') {
            filteredArr[filter.key] = new Object();
            filteredArr[filter.key].valuesRaw = [];
        }

        filteredArr[filter.key].valuesRaw.push(filter.value);


        if (typeof filteredArr[filter.key].values === 'undefined')
            filteredArr[filter.key].values = new Object;

        filteredArr[filter.key].values[filter.id] = filter;
    });

    return filteredArr;
}

ymaps.ready(init);


function init() {
    var objectManager = new ymaps.ObjectManager({
        // Чтобы метки начали кластеризоваться, выставляем опцию.
        clusterize: true,
        // ObjectManager принимает те же опции, что и кластеризатор.
        gridSize: 32,
        clusterDisableClickZoom: false,
        geoObjectOpenBalloonOnClick: false,
        clusterOpenBalloonOnClick: false
    });

    var myMap = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10,
        controls: []
    }, {
        searchControlProvider: 'yandex#search'
    });

    // Чтобы задать опции одиночным объектам и кластерам,
    // обратимся к дочерним коллекциям ObjectManager.
    //objectManager.objects.options.set('preset', 'islands#greenDotIcon');

     objectManager.objects.options.set({
        // Опции.
        // Необходимо указать данный тип макета.
        iconLayout: 'default#image',
        // Своё изображение иконки метки.
        iconImageHref: '/assets/ymapbash/maps-and-flags-1.svg',
        // Размеры метки.
        iconImageSize: [34, 34],
        // Смещение левого верхнего угла иконки относительно
        // её "ножки" (точки привязки).
        iconImageOffset: [-17, -34]
    });
    objectManager.clusters.options.set({preset: 'islands#blackClusterIcons'});
    myMap.geoObjects.add(objectManager);

    $.ajax({
        url: "/assets/ymapbash/yandexMap.php"
    }).done(function (data) {
        objectManager.add(data);
        // Покажем карту так, чтобы влезли все объекты 
        myMap.setBounds(objectManager.getBounds(), { duration: 500, checkZoomRange: true, zoomMargin: 10 });
    });

    function onObjectEvent(e) {
        if (e.get('type') == 'click') {
            var objectId = e.get('objectId');
            toObjCenterAndBack(objectId, $('.bashMapObjLink[data-migxid="' + objectId + '"]').parent())
        }
    }
    objectManager.objects.events.add(['click'], onObjectEvent);

    $('.bashMapObjLink').click(function (e) {
        e.preventDefault();
        toObjCenterAndBack($(this).data('migxid'), $(this).parent());
    });

    $('.mapFullInfo .close').click(function (e) {
        e.preventDefault();
        $(this).parents('li.opened').find('.bashMapObjLink').click();
    });

    $('.filter_val [type=checkbox]').change(function () {
        filterTheMap();
    });

    function toObjCenterAndBack(id, parent) {

        parent.toggleClass('opened');

        if (parent.hasClass('opened')) {
            var object = objectManager.objects.getById(id);
            myMap.setCenter(object.geometry.coordinates, 15, { duration: 500 });
        }
        else
            filterTheMap(); // Отфильтруем по тому что выбрано и поедем к центру

    }

    function filterTheMap() {

        var justChangedFilter = getFilterArr();
        var wholeFilter = getFilterArr(false);
        var updatedFilters = new Object;
        var dealerCount = 0;
        var panPoint = [];

        // Блокируем фильтры пока не фильтранули
        //var changedName = $(this).attr('name');
        $('.filter_val [type=checkbox]:not(:checked)').each(function () {
            //if ($(this).attr('name') != changedName)
            $(this).prop('disabled', true).parent().addClass('disabled');
        });

        objectManager.setFilter(function (object) {
            // Если хотя бы 1 фильтр не подойдет - вырубаем точку
            var flag = true;

            $.each(justChangedFilter, function (key, filterObj) {

                // Проверка если есть в массиве пропертис такой элемент, или равен строке
                if (Array.isArray(object.properties[key])) {
                    let includes = object.properties[key].filter(x => filterObj.valuesRaw.includes(x));
                    if (includes.length == 0)
                        flag = false;
                }
                else if (!filterObj.valuesRaw.includes(object.properties[key]))
                    flag = false;

            });

            if (flag) {
                // На этот момент точно знаем, что этот пункт остается, соберем его свойства для обновления фильтра

                if (dealerCount == 0)
                    panPoint = object.geometry.coordinates;

                dealerCount++;

                $.each(wholeFilter, function (key, filterObjByKey) {
                    $.each(filterObjByKey.values, function (innreKey, filterObjByDomId) {
                        if (object.properties[key].includes(filterObjByDomId.value) || object.properties[key] == filterObjByDomId.value) {
                            if (typeof updatedFilters[filterObjByDomId.id] === 'undefined')
                                updatedFilters[filterObjByDomId.id] = 1;
                            else
                                updatedFilters[filterObjByDomId.id] += 1;
                        }
                    });
                });
            }

            return flag;
        });

        //console.log(objectManager);


        // Проверим случаи, когда отмеченным остается невозможный вариант
        $('.filter_val [type=checkbox]:checked').each(function () {
            if (updatedFilters[$(this).attr('id')] === undefined)
                $(this).prop('checked', false).prop('disabled', true).parent().addClass('disabled');;
        });

        // Разблокируем фильтры
        $.each(updatedFilters, function (checkboxId, itemsCount) {
            $('#' + checkboxId).prop('disabled', false).parent().removeClass('disabled');
        });

        // Разблокируем элементы фильтра, если применен только по 1 ключу
        if (Object.keys(justChangedFilter).length == 1)
            $('.filter_val [type=checkbox][name=' + Object.keys(justChangedFilter).pop() + ']:disabled').prop('disabled', false).parent().removeClass('disabled');

        // Обновим список слева
        $('.bashMapObjLink').each(function(){
            var id = $(this).data('migxid');
            if(objectManager.getObjectState(id).isFilteredOut)
                $(this).parent().hide();
            else
                $(this).parent().show();
        });

        // Обновим границы карты
        if (dealerCount > 1)
            myMap.setBounds(objectManager.getBounds(), {
                duration: 500,
                checkZoomRange: true,
                zoomMargin: 10
            });
        else if (dealerCount == 1) {
            myMap.setCenter(panPoint, 15, { duration: 500 });
        }

    }
}
