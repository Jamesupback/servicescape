function cancelBooking(id,index){
    window.location.reload()
    fetch('/cancelbooking',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({bookingid:id})
    })
    window.location.reload()
}

function paydemo(id,index){
    const dashboard=document.getElementById('dashboard')
    const payment=document.getElementById('payment')
    const bookingid=document.getElementById('bookingid')
    dashboard.style.display='none'
    payment.style.display = 'block';
    bookingid.value=id

}
function paynow(id,index){
    const dashboard=document.getElementById('dashboard')
    const payment=document.getElementById('payment')
    dashboard.style.display='block'
    payment.style.display='none'

}
function cancel(index,id){
     fetch('/deleteentryuser',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({bookingid:id})
     })
     window.location.reload()
}