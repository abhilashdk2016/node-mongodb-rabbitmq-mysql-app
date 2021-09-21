import * as express from 'express';
import * as cors from 'cors';
import "reflect-metadata";
import { createConnection } from 'typeorm';
import connectionOptions from '../ormconfig';
import { Product } from './entity/product';
import * as amqp from 'amqplib/callback_api';

createConnection(connectionOptions).then(db => {
    const productRepository = db.getRepository(Product);
    amqp.connect('amqp://localhost:5672', (error0, connection) => {
        if(error0) {
            throw error0;
        }

        connection.createChannel((error1, channel) => {
            if(error1) {
                throw error1;
            };

            const app = express();
            app.use(cors({
                origin: ['http://localhost:3000']
            }));
            app.use(express.json());

            app.get("/api/products", async (req: express.Request, res: express.Response) => {
                const products = await productRepository.find();
                return res.json(products);
            });

            app.post('/api/products', async (req: express.Request, res: express.Response) => {
                const product = await productRepository.create(req.body);
                const result = await productRepository.save(product);
                channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));
                return res.status(201).send(result);
            });

            app.get('/api/products/:productId', async (req: express.Request, res: express.Response) => {
                const product = await productRepository.findOne(req.params.productId);
                return res.send(product);
            });

            app.put('/api/products/:productId', async (req: express.Request, res: express.Response) => {
                const product = await productRepository.findOne(req.params.productId);
                productRepository.merge(product, req.body);
                const result = await productRepository.save(product);
                channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));
                return res.status(200).send(result);
            });

            app.delete('/api/products/:productId', async (req: express.Request, res: express.Response) => {
                const product = await productRepository.findOne(req.params.productId);
                const result = await productRepository.delete(product);
                channel.sendToQueue('product_deleted', Buffer.from(JSON.stringify(req.params.productId)));
                return res.status(200).send(result);
            });

            app.post('/api/products/:productId/likes', async (req: express.Request, res: express.Response) => {
                const product = await productRepository.findOne(req.params.productId);
                product.like++;
                const result = await productRepository.save(product);
                return res.status(200).send(result);
            });

            app.listen(8000 , () => console.log("Server running on PORT 8000"));
            process.on('beforeExit', () => {
                console.log('closing');
                connection.close();
            });
        });
    });
})
.catch(e => console.log(e));