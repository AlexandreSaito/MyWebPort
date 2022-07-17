'use strict';
import Site from './siteServer.js';
import { startSocketServer } from './webSocketServer.js';
import { startAllSocketModules } from './sockets/sockets.js';

Site.createServer();
startSocketServer(Site.getServer());

startAllSocketModules();
//gameServer.startServer();
