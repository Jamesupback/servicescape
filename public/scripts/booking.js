function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            document.getElementById('locationLink').value = `https://www.google.com/maps/place/${latitude},${longitude}`;
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}