  
    document.addEventListener('DOMContentLoaded', function() {
        const namesearch = document.getElementById('namesearch');
        const cityserach = document.getElementById('citysearch');
        const ratingsearch = document.getElementById('ratingsearch');
        const availabilitysearch = document.getElementById('availabilitysearch');

        namesearch.addEventListener('input', filternames);
        cityserach.addEventListener('input', filtercity);
        ratingsearch.addEventListener('change', filterrating);
        availabilitysearch.addEventListener('change', filteravailability);

        function filteravailability() {
            const searchValue = availabilitysearch.value;
            const records = document.getElementsByClassName('record');
            Array.from(records).forEach(record => {
                const status = record.childNodes[5].innerText.slice(8).toLowerCase();

                if (searchValue == "0" || status === searchValue) {
                    record.style.display = 'block';
                } else {
                    record.style.display = 'none';
                }
            });
        }

        function filterrating() {
            const searchValue = ratingsearch.value;
            const records = document.getElementsByClassName('record');
            console.log(records[0].childNodes[7].innerText.slice(8).split(' ').length)
            Array.from(records).forEach(record => {
                const rating = record.childNodes[7].innerText.slice(8).split(' ').length;

                if (rating >= searchValue) {
                    record.style.display = 'block';
                } else {
                    record.style.display = 'none';
                }
            });
        }
        function filtercity() {
            const searchValue = citysearch.value.toLowerCase();
            const records = document.getElementsByClassName('record');
            Array.from(records).forEach(record => {
                const city = record.childNodes[3].innerText.toLowerCase();

                if (city.includes(searchValue)) {
                    record.style.display = 'block';
                } else {
                    record.style.display = 'none';
                }
            });
        }
        function filternames() {
            const searchValue = namesearch.value.toLowerCase();
            const records = document.getElementsByClassName('record');
            console.log(records);
            Array.from(records).forEach(record => {
                const name = record.childNodes[1].innerText.toLowerCase();

                if (name.includes(searchValue)) {
                    record.style.display = 'block';
                } else {
                    record.style.display = 'none';
                }
            });
        }
    });