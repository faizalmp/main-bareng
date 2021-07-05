/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {

  // Authentication
  Route.post('/register', 'AuthController.register').as('auth.register')
  Route.post('/login', 'AuthController.login').as('auth.login').middleware('confirmed')
  Route.post('/otp-confirmation', 'AuthController.otp').as('auth.otp')

  // Venues
  Route.resource('venues', 'VenuesController').only([
    'index',
    'show',
    'store',
    'update',
    'destroy'
  ]).apiOnly().middleware({
    '*': ['auth', 'verify'],
    'store': ['owner'],
    'update': ['owner'],
    'destroy': ['owner']
  })
  Route.post('/venues/:id/bookings', 'BookingsController.store').as('bookings.store').middleware(['auth', 'verify'])
  Route.post('/venues/:id/fields', 'FieldsController.store').as('fields.fields').middleware(['auth', 'verify'])

  // Fields
  Route.resource('fields', 'FieldsController').only([
    'index',
    'show',
    'update',
    'destroy'
  ]).apiOnly().middleware({ 
    '*': ['auth', 'verify'],
    'update': ['auth', 'verify', 'owner'],
    'destroy': ['auth', 'verify', 'owner']
  })

  // Bookings
  Route.get('/bookings', 'BookingsController.index').as('bookings.index').middleware(['auth', 'verify'])
  Route.get('/bookings/:id', 'BookingsController.show').as('bookings.show').middleware(['auth', 'verify'])
  Route.put('/bookings/:id/join', 'BookingsController.join').as('bookings.join').middleware(['auth', 'verify'])
  Route.put('/bookings/:id/unjoin', 'BookingsController.unjoin').as('bookings.unjoin').middleware(['auth', 'verify'])
  Route.get('/schedules', 'BookingsController.schedule').as('bookings.schedule').middleware(['auth', 'verify'])

}).prefix('/api/v1')
