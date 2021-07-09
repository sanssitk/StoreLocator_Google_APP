var map, infowindow;
var markers = [];
const API_URL = "http://localhost:3000/api/stores";
initMap = () => {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 34.063584,
            lng: -118.376354,
        },
        zoom: 10,
    });
    infowindow = new google.maps.InfoWindow();
}

const onEnter = (e) => {
    if (e.key == "Enter") {
        clearLocations();
        getStores();
    }
}

const getStores = () => {
    const zipCode = document.getElementById('zip-code').value;
    if (!zipCode) return;
    const fullUrl = `${API_URL}?zip_code=${zipCode}`;
    fetch(fullUrl)
        .then((response) => {
            if (response.status == 200) {
                return response.json();
            } else {
                throw new Error(response.status);
            }
        }).then((data) => {
            if (data.length > 0) {
                clearLocations();
                setStoresList(data);
                searchLocationsNear(data);
                setOnClickListener();
            } else {
                clearLocations();
                noStoresFound()
            }
        })
}

const setStoresList = (stores) => {
    let storesHtml = '';
    stores.map((store, index) => {
        storesHtml += `
            <div class="stores-list">
                <div class="store-list-box">
                     <div class="store-info-container">
                            <div class="address-line1">${store["addressLines"][0]}</div>
                            <div class="address-line2">${store["addressLines"][1]}</div>
                            <div class="phone">
                                <i class="fas fa-phone-alt icon"></i>
                                <span>${store["phoneNumber"]}</span>
                            </div>
                        </div>
                    <div class="store-info-number">${index+1}</div>
                </div>
            </div>
        `
    })
    document.querySelector('.stores-list-container').innerHTML = storesHtml;
}

const searchLocationsNear = (stores) => {
    let bounds = new google.maps.LatLngBounds();
    stores.map((store, index) => {
        let myLatLng = new google.maps.LatLng(
            store.location.coordinates[1], store.location.coordinates[0]
        )
        let name = store.storeName;
        let address = store.addressLines[0];
        let openStatusText = store.openStatusText;
        let phone = store.phoneNumber;
        bounds.extend(myLatLng);
        createMarker(myLatLng, name, address, openStatusText, phone, index + 1);
    })
    map.fitBounds(bounds);
}

const clearLocations = () => {
    infowindow.close();
    for (var i = 0; i < markers.length; i++) {
        markers[1].setMap(null);
    }
    markers.length = 0;
}

const noStoresFound = () => {
    const message = `
        <div class="find-stores-list">
            <strong style="color: red">Address NOT FOUND! TRY AGAIN</strong>
        </div>`

    document.querySelector(".stores-list-container").innerHTML = message;
}

function setOnClickListener() {
    var storeElements = document.querySelectorAll('.stores-list');
    storeElements.forEach((elem, index) => {
        elem.addEventListener('click', function () {
            new google.maps.event.trigger(markers[index], 'click');
        })
    })
}


const createMarker = (myLatLng, name, address, openStatusText, phone, storeNumber) => {
    let html = `
    <div class="store-info-window">
        <div class="store-info-name">${name}</div>
        <div class="store-info-status">${openStatusText}</div>
        <div class="store-info-address">
        <i class="fas fa-location-arrow icon"></i>
            <span>${address}</span>
        </div>
        <div class="store-info-phone">
            <a href="tel: ${phone}">
                <i class="fas fa-phone-alt icon"></i>
                <span>${phone}</span>
            </a>            
        </div>
    </div>
    `
    var marker = new google.maps.Marker({
        position: myLatLng,
        label: `${storeNumber}`,
        map,
    })

    google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(html);
        infowindow.open(map, marker);
    })
    markers.push(marker)
}