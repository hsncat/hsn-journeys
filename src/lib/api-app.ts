// ============================================================
// Shared Hono API app — used by both Pages Functions and Astro endpoint
// ============================================================
import { Hono } from 'hono';
import { auth } from './auth-middleware';
import * as authHandlers from '../../functions/api/auth';
import * as journeyHandlers from '../../functions/api/journeys';
import * as wishlistHandlers from '../../functions/api/wishlist';
import * as packingHandlers from '../../functions/api/packing';
import * as photoHandlers from '../../functions/api/photos';
import * as coordinateHandlers from '../../functions/api/coordinates';
import * as statsHandlers from '../../functions/api/stats';
import * as deployHandlers from '../../functions/api/trigger-deploy';

export function createApiApp(): Hono {
  const app = new Hono();

  // Auth
  app.post('/api/auth/login', authHandlers.login);
  app.post('/api/auth/register', authHandlers.register);
  app.get('/api/auth/me', auth, authHandlers.me);

  // Journeys
  app.get('/api/journeys', journeyHandlers.listJourneys);
  app.get('/api/journeys/:id', journeyHandlers.getJourney);
  app.post('/api/journeys', auth, journeyHandlers.createJourney);
  app.put('/api/journeys/:id', auth, journeyHandlers.updateJourney);
  app.delete('/api/journeys/:id', auth, journeyHandlers.deleteJourney);
  app.post('/api/journeys/:jid/subcards', auth, journeyHandlers.createSubCard);
  app.put('/api/journeys/:jid/subcards/:sid', auth, journeyHandlers.updateSubCard);
  app.delete('/api/journeys/:jid/subcards/:sid', auth, journeyHandlers.deleteSubCard);

  // Wishlist
  app.get('/api/wishlist', wishlistHandlers.listWishlist);
  app.post('/api/wishlist', auth, wishlistHandlers.createWishlist);
  app.put('/api/wishlist/:id', auth, wishlistHandlers.updateWishlist);
  app.delete('/api/wishlist/:id', auth, wishlistHandlers.deleteWishlist);

  // Packing
  app.get('/api/packing', packingHandlers.listPacking);
  app.post('/api/packing/category', auth, packingHandlers.createCategory);
  app.put('/api/packing/category/:id', auth, packingHandlers.updateCategory);
  app.delete('/api/packing/category/:id', auth, packingHandlers.deleteCategory);
  app.post('/api/packing/item', auth, packingHandlers.createItem);
  app.put('/api/packing/item/:id', auth, packingHandlers.updateItem);
  app.delete('/api/packing/item/:id', auth, packingHandlers.deleteItem);

  // Photos
  app.post('/api/photos/upload', auth, photoHandlers.uploadPhoto);
  app.delete('/api/photos/:key', auth, photoHandlers.deletePhoto);

  // Coordinates
  app.get('/api/coordinates', coordinateHandlers.listCoordinates);
  app.post('/api/coordinates', auth, coordinateHandlers.createCoordinate);
  app.put('/api/coordinates/:id', auth, coordinateHandlers.updateCoordinate);
  app.delete('/api/coordinates/:id', auth, coordinateHandlers.deleteCoordinate);

  // Stats
  app.get('/api/stats', statsHandlers.getStats);

  // Deploy trigger
  app.post('/api/trigger-deploy', auth, deployHandlers.triggerDeploy);

  return app;
}
