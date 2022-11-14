$(function (){
    // globally defined lng, lat, and update put into an object to be called as properties/methods.
    const Defaults = {
        lat: 29.428106704221186,
        lng: -98.49567610253364,
        mapStyle: 'mapbox://styles/mapbox/streets-v11',
        update(){
            $.get("http://api.openweathermap.org/data/2.5/forecast", {
                APPID: OPEN_WEATHER_APPID,
                lat:    Defaults.lat,
                lon:    Defaults.lng,
                units: "imperial"
            }).done(function(data) {
                function mostFrequent(array){
                    const arrayElementsCount = array.reduce(function(total, element){
                        if (!total[element]) {
                            total[element] = 1;
                        } else {
                            total[element] = total[element] + 1;
                        }
                        return total;
                    }, {});
                    const arraySorted = Object.entries(arrayElementsCount).sort(function(a, b){
                        return b[1] - a[1];
                    });
                    return arraySorted[0][0];
                }
                function windCardinalDirection(degrees){
                    let cardinalDirection = '';
                    if ((degrees > 348.75 && degrees <= 360) || (degrees >=0 && degrees <= 11.25)){
                        cardinalDirection = "N";
                    } else if (degrees > 11.25 && degrees  <= 33.75) {
                        cardinalDirection = "NNE";
                    } else if (degrees > 33.75 && degrees <= 56.25) {
                        cardinalDirection = "NE";
                    } else if (degrees > 56.25 && degrees <= 78.75) {
                        cardinalDirection = "ENE";
                    } else if (degrees > 78.75 && degrees <= 101.25) {
                        cardinalDirection = "E";
                    } else if (degrees > 101.25 && degrees <= 123.75) {
                        cardinalDirection = "ESE";
                    } else if (degrees > 123.75 && degrees <= 146.25) {
                        cardinalDirection = "SE";
                    } else if (degrees > 146.25 && degrees <= 168.75) {
                        cardinalDirection = "SSE";
                    } else if (degrees > 168.75 && degrees <= 191.25) {
                        cardinalDirection = "S";
                    } else  if (degrees > 191.25 && degrees <= 213.75) {
                        cardinalDirection = "SSW";
                    } else if (degrees > 213.75 && degrees <= 236.25)  {
                        cardinalDirection = "SW";
                    } else if (degrees > 236.25 && degrees <= 258.75) {
                        cardinalDirection = "WSW";
                    } else if (degrees > 258.75 && degrees <= 281.25) {
                        cardinalDirection = "W";
                    } else if (degrees > 281.25 && degrees <= 303.75) {
                        cardinalDirection = "WNW";
                    } else if (degrees > 303.75 && degrees <= 326.25) {
                        cardinalDirection = "NW";
                    } else if (degrees > 326.75 && degrees <= 348.75) {
                        cardinalDirection = "NNW";
                    }
                    return cardinalDirection;
                }
                console.log(data)

                function loop() {
                    for (let j = 1; j <= 5; j++) {
                        let utilArray = [];
                        let utilArray1 = [];
                        let high = -900;
                        let low = 10000;
                        let wNumber = dNumber = pNumber = hNumber = 0;
                        for (let i = ((j - 1) * 8); i < (j * 8); i++) {
                            if (data.list[i].main.temp_max > high) {
                                high = data.list[i].main.temp_max;
                            }
                            if (data.list[i].main.temp_min < low) {
                                low = data.list[i].main.temp_min;
                            }
                            utilArray.push(data.list[i].weather[0].icon);
                            utilArray1.push(data.list[i].weather[0].description);
                            wNumber += data.list[i].wind.speed;
                            dNumber += data.list[i].wind.deg;
                            pNumber += data.list[i].main.pressure;
                            hNumber += data.list[i].main.humidity;
                        }
                        $(`#hi-low${j},#hi-low${j}c`).html(`<p class="card-text">${low}&deg;F/${high}&deg;F</p><img class="images" src="http://openweathermap.org/img/w/${mostFrequent(utilArray)}.png">`);
                        $(`#day${j}-description,#day${j}c-description`).text(`Description: ${mostFrequent(utilArray1)}`);
                        $(`#day${j}-wind`).html(`Wind: ${(wNumber / 8).toFixed(2)}<br>${windCardinalDirection(parseInt(dNumber / 8))}`);
                        $(`#day${j}-pressure,#day${j}c-pressure`).text(`Pressure: ${parseInt(pNumber / 8)} mb`);
                        $(`#day${j}-humidity,#day${j}c-humidity`).text(`Humidity: ${parseInt(hNumber / 8)}%`);
                        $(`#date-${j},#date-${j}c`).text(data.list[(j - 1) * 8].dt_txt.slice(0,10));
                        $(`#day${j}c-wind`).html(`Wind: ${(wNumber / 8).toFixed(2)} ${windCardinalDirection(parseInt(dNumber / 8))}`);
                    }
                }
                loop()

                reverseGeocode({lat: Defaults.lat, lng: Defaults.lng}, WEATHER_MAP_TOKEN).then(function(reverseResults){
                    console.log(reverseResults);
                    let resultantArray = reverseResults.split(', ');
                    let regexNumberCheck = / \d/;
                    if (resultantArray.indexOf(data.city.name) === -1) {
                        stateNameUSA = String(String(reverseResults.split(', ')[resultantArray.findIndex(value => /[a-z|A-Z]\s\d/.test(value))]).split(regexNumberCheck)[0]);
                    } else {
                        stateNameUSA = String(String(reverseResults.split(', ')[resultantArray.indexOf(data.city.name) + 1]).split(regexNumberCheck)[0]);
                    }
                    if (data.city.country === 'US') {
                        $('#m-current-city').text(`${data.city.name}, ${stateNameUSA}, USA`).val('');
                        $('#current-city').attr('placeholder', `${data.city.name}, ${stateNameUSA}, USA`).val('');
                    } else{
                        $('#m-current-city').text(`${data.city.name}, ${data.city.country}`).val('');
                        $('#current-city').attr('placeholder', `${data.city.name}, ${data.city.country}`).val('');
                    }
                })
            });
        }
    }
    Defaults.update();


    //the following makes the map visible
    mapboxgl.accessToken = WEATHER_MAP_TOKEN;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: Defaults.mapStyle, // style URL
        center: [Defaults.lng, Defaults.lat], // starting position [lng, lat]
        zoom: 10, // starting zoom
        projection: 'globe' // display the map as a 3D globe
    });

    // the following puts a marker on the map, and when the marker is dragges, map is double clicked, or search bar is used, calls updateScreen.
    const marker = new mapboxgl.Marker({
        color: "#FF0000",
        draggable: true
    }).setLngLat([Defaults.lng, Defaults.lat])
        .addTo(map);
    map.on('dblclick', e => {
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat])
        Defaults.lat = e.lngLat.lat;
        Defaults.lng = e.lngLat.lng;
        Defaults.update();
    });
    marker.on('dragend', () => {
        Defaults.lat = marker.getLngLat().lat;
        Defaults.lng = marker.getLngLat().lng;
        Defaults.update();
    });
    $('#search-input, #current-city').on('keypress',function(e) {
        if(e.which === 13 || e.keyCode === 13) {
            if ($(this).val().toLowerCase() === "make it dark"){
                map.setStyle('mapbox://styles/danielname/cl9il5e61000f14rqdxjtoqxz');
                Defaults.update();
                $(this).val("");
                $('header, #current-city, #m-current-city, .dnModal-button2, .card-body, .card-header, .list-group-item, body, #search-input, .dnModal-content, .dnModal-content2').toggleClass('dark');
            } else if ($(this).val().toLowerCase() === "let there be light") {
                map.setStyle('mapbox://styles/mapbox/streets-v11');
                Defaults.update();
                $(this).val("");
                $('header, #current-city, #m-current-city, .dnModal-button2, .card-body, .card-header, .list-group-item, body, #search-input, .dnModal-content, .dnModal-content2').toggleClass('dark');

            } else {
                geocode($(this).val(), WEATHER_MAP_TOKEN).then(function (result) {
                    Defaults.lat = result[1];
                    Defaults.lng = result[0];
                    let stateNameUSA = '';
                    map.setCenter([Defaults.lng, Defaults.lat]);
                    Defaults.update();
                    marker.setLngLat([Defaults.lng, Defaults.lat]);
                });
                $(this).val("");
            }
        }
    });


    $('#search-bar-label').on('click', function(){
        document.getElementById("input-container").classList.toggle("show-input");
    })

    // When the user clicks on the button, open the modal
    $('.dnModal-button').on('click', function(){
        $('.dnModal, .dnModal-content').css('display', "block");
    });
    // When the user clicks on <span> (x), close the modal
    $('.dnModal-close').on('click', function(){
        $('.dnModal, .dnModal-content').css('display', "none");
    });

    // When the user clicks on the button, open the modal
    $('.dnModal-button2').on('click', function(){
        $('.dnModal2, .dnModal-content2').css('display', "block");
    });
    // When the user clicks enter on the search it closes the modal
    $('.dnModal2').on('keyup', function(e){
        if(e.which === 13 || e.keyCode === 13) {
            $('.dnModal2, .dnModal-content2').css('display', "none");
        }
    });


    const modal = document.getElementsByClassName('dnModal2')[0];
    const modal2 = document.getElementsByClassName('dnModal')[0];

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal || event.target == modal2) {
            modal.style.display = "none";
            modal2.style.display = "none";
        }
    }

    // When the user clicks the current city on desktop, it replaces the location with a searchbar that lets you change the city
    // I think i should attempt to use display to show and hide the two sections.

    // $('#current-city').on('click',function(){
    //     $(this).html('<div id="input-container"><input type="text" name="search-input" id="search-input"></div>')
    // })

});