import express from 'express';
import * as chats from './routes/chats';
import * as events from './routes/events';
import * as index from './routes/index';
import * as metadata from './routes/metadata';
import * as products from './routes/products';
import * as usergroups from './routes/usergroups';
import * as users from './routes/users';

const app = express();

chats.register(app);
events.register(app);
index.register(app);
metadata.register(app);
products.register(app);
usergroups.register(app);
users.register(app);

app.listen(3000, () => {
    console.log('App listening on port 3000.')
});
