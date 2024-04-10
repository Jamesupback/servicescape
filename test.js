const mongoose = require('mongoose');
const { Workers } = require('./schema');

mongoose.connect('mongodb+srv://jamesupback:genius@cluster0.smqhrqs.mongodb.net/servicescape?retryWrites=true&w=majority').then(()=>"db connected").catch((err)=>console.log(err));

async function finds(){
   await  Workers.find({}).then((data)=>{
        data.forEach(worker => {
            worker.reviews = worker.reviews.filter(review => review.rating != null);
            worker.save().then((data)=>console.log(data)).catch((err)=>console.log(err));
        });
   })
}
finds()
// Workers.find({name:'John Doe'}, (err, worker) => {
//     if (err) {
//         console.error(err);
//         return;
//     }

//         worker.reviews = worker.reviews.filter(review => review.reviewer === 'test');
//         worker.save((err, savedWorker) => {
//             if (err) {
//                 console.error(err);
//                 return;
//             }
//             console.log('Reviews updated for worker:', savedWorker);
//         });
//     });
