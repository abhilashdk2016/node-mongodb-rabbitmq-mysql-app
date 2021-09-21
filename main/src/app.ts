import * as express from 'express';
import * as cors from 'cors';
import "reflect-metadata";
import { createConnection } from 'typeorm';
import connectionOptions from '../ormconfig';
import * as amqp from 'amqplib/callback_api';
import { Product } from './entity/product';
import axios from 'axios';

createConnection(connectionOptions).then(db => {
    const productRepository = db.getMongoRepository(Product);
    amqp.connect('amqp://localhost:5672', (error0, connection) => {
        if(error0) {
            throw error0;
        }

        connection.createChannel((error1, channel) => {
            if(error1) {
                throw error1;
            };
            channel.assertQueue('product_created', { durable: false });
            channel.assertQueue('product_updated', { durable: false });
            channel.assertQueue('product_deleted', { durable: false });
            const app = express();
            app.use(cors({
                origin: ['http://localhost:3000']
            }));
            app.use(express.json());

            channel.consume('product_created', async message => {
                const eventProduct: Product = JSON.parse(message.content.toString());
                const product = new Product();
                product.admin_id = parseInt(eventProduct.id);
                product.title = eventProduct.title;
                product.image = eventProduct.image;
                product.like = eventProduct.like;
                await productRepository.save(product);
                console.log('Product Created');
            }, { noAck: true });

            channel.consume('product_updated', async message => {
                const eventProduct: Product = JSON.parse(message.content.toString());
                const product = await productRepository.findOne({ admin_id: parseInt(eventProduct.id)});
                productRepository.merge(product, {
                    title : eventProduct.title,
                    image : eventProduct.image,
                    like : eventProduct.like
                });
                await productRepository.save(product);
                console.log('Product Updated');
            }, { noAck: true });

            channel.consume('product_updated', async message => {
                const eventProduct: Product = JSON.parse(message.content.toString());
                const product = await productRepository.findOne({ admin_id: parseInt(eventProduct.id)});
                productRepository.merge(product, {
                    title : eventProduct.title,
                    image : eventProduct.image,
                    like : eventProduct.like
                });
                await productRepository.save(product);
                console.log('Product Updated');
            }, { noAck: true });

            channel.consume('product_deleted', async message => {
                const adminId = parseInt(message.content.toString());
                await productRepository.deleteOne({ admin_id: adminId});
                console.log('Product Deleted');
            }, { noAck: true });

            app.get('/api/products', async (req: express.Request, response: express.Response) => {
                const products = await productRepository.find();
                return response.json(products);
            });

            app.post('/api/products/:productId/like', async (req: express.Request, response: express.Response) => {
                const product = await productRepository.findOne({ admin_id: parseInt(req.params.productId)});
                const res = await axios.post(`http://localhost:8000/api/products/${product.admin_id}/likes`);
                product.like++;
                await productRepository.save(product);
                response.send(product);
            });

            app.listen(8001 , () => console.log("Server running on PORT 8001"));
            process.on('beforeExit', () => {
                console.log('closing');
                connection.close();
            });
        });
    });
})
.catch(e => console.log(e));