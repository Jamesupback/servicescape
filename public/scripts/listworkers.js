  
    document.addEventListener('DOMContentLoaded', function() {
        const namesearch = document.getElementById('namesearch');
        if (namesearch) {
            namesearch.addEventListener('input', filternames);
        }

        const cityserach = document.getElementById('citysearch');
        if (cityserach) {
            cityserach.addEventListener('input', filtercity);
        }

        const ratingsearch = document.getElementById('ratingsearch');
        if (ratingsearch) {
            ratingsearch.addEventListener('change', filterrating);
        }

        const availabilitysearch = document.getElementById('availabilitysearch');
        if (availabilitysearch) {
            availabilitysearch.addEventListener('change', filteravailability);
        }

        const professionsearch = document.getElementById('professionsearch');
        if (professionsearch) {
            professionsearch.addEventListener('input', filterprofession);
        }

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
            Array.from(records).forEach(record => {
                const name = record.childNodes[1].innerText.toLowerCase();

                if (name.includes(searchValue)) {
                    record.style.display = 'block';
                } else {
                    record.style.display = 'none';
                }
            });
        }
        function filterprofession(){
            const searchValue = professionsearch.value.toLowerCase();
            const records = document.getElementsByClassName('record');
            Array.from(records).forEach(record => {
                const profession = record.childNodes[11].innerText.toLowerCase();

                if (profession.includes(searchValue)) {
                    record.style.display = 'block';
                } else {
                    record.style.display = 'none';
                }
            });
        }
    });