var map;
var infowindow;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: {
            lat: -118.358080,
            lng: 34.063380
        },
    });
    infowindow = new google.maps.InfoWindow();
    getStores();
}

const getStores = () => {
    const API_URL = "http://localhost:3000/api/stores";
    fetch(API_URL)
        .then(res => {
            if (res.status === 200) {
                return res.json()
            } else {
                throw new Error(res.status)
            }
        })
        .then(stores => searchLocationsNear(stores));
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

const createMarker = (myLatLng, name, address, openStatusText, phone, storeNumber) => {
    let html = `
    <div class="store-info-window">
        <div class="store-info-name">${name}</div>
        <div class="store-info-status">${openStatusText}</div>
        <div class="store-info-address">
            <span>${address}</span>
        </div>
        <div class="store-info-phone">${phone}</div>
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
}