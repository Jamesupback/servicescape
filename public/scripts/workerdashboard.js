 
        function reqpayment(index,id){
           
            alert('Payment requested');
            
            fetch('/requestpayment',{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({bookingid:id})
            })
            window.location.reload()
        }

        function rejected(index,id){
            alert('Booking Rejected')
      
            fetch('/rejectbooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookingstatus: 'rejected', bookingid: id })
            })
            window.location.reload()
        }
        function cancel(index,id){
            window.location.reload()
             fetch('/deleteentryworker',{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({bookingid:id})
             })
            window.location.reload() 
        }
        function accepted(index,id){
            fetch('/acceptbooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookingstatus:'done',bookingid: id })
            })
            window.location.reload()
        }       