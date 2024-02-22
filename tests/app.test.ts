import request from 'supertest';
import app from '../src/server';

describe('GET /', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .get('/')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual({ message: 'Hello Uncut' });
    });
});