<div class="superMap">
    <div class="mapLeft">
        <div class="mapSettings">
            <div class="catalog-settings">
                <form action="https://shop.miniwarpaint.ru/shop/stuff/dopolneniya-dlya-modelej" method="post"
                    id="mse2_filters" class="filter-bl">
                    [[!YMapsDealersSnippetFilters?
                        &tplFilter=`<fieldset><div class="filter_title">[[+name]] <i class="las la-filter"></i></div><div class="filter_val">[[+wrapper]]</div></fieldset>`
                        &tplFilterOption=`<label for="[[+key]][[+MIGX_id]]" class="">
                                <input type="checkbox" name="[[+key]]" id="[[+key]][[+MIGX_id]]" value="[[+name]]" />
                                <span>[[+name]] </span>
                            </label>
                            <br/>`
                    ]]
                </form>
            </div>
        </div>

        <aside class="mapItems">
            <div class="aside-block">
                <div class="aside-block-title">Дилеры</div>
                <ul class="aside-menu aside-block-body bashMapObjList">
                    [[!getImageList?
                        &tvname=`map_migx`
                        &docid=`[[*id]]`
                        &where=`{"active":"1"}`
                        &tpl=`mapInfoTpl`
                    ]]
                </ul>
            </div>
        </aside>
    </div>



    <div id="map"></div>
    <script src="https://api-maps.yandex.ru/2.1/?lang=ru-RU&amp;apikey=cdd00504-c516-49da-b748-561c34e51d54" type="text/javascript"></script>
    <script src="https://yandex.st/jquery/2.2.3/jquery.min.js" type="text/javascript"></script>
    <script src="https://modxmap.rock-n-scroll.ru/assets/template/bashMap.js" type="text/javascript"></script>

  </div>
