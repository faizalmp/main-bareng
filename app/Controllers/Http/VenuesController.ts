import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VenueValidator from 'App/Validators/VenueValidator'
import Venue from 'App/Models/Venue'

export default class VenuesController {

/**
  * @swagger
  * /api/v1/venues:
  *   get:
  *     security:
  *       - bearerAuth: []
  *     tags:
  *       - Venues
  *     summary: Get all venues
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/

    public async index({ response }: HttpContextContract) {
        let venues = await Venue.query().preload('user', (query) => {
            query.select('id', 'name')
        }).preload('fields', (query) => {
            query.select('id', 'name', 'type')
        })
        if (venues) {
            return response.ok({ message: 'Success', data: venues })   
        }
        return response.badRequest({ message: 'No data' })
    }

/**
  * @swagger
  * /api/v1/venues:
  *   post:
  *     security:
  *       - bearerAuth: []
  *     tags:
  *       - Venues
  *     summary: Create Venue
  *     requestBody:
  *       required: true
  *       content:
  *         application/x-www-form-urlencoded:
  *           schema:
  *             $ref: '#definitions/Venue'
  *         application/json:
  *           schema:
  *             $ref: '#definitions/Venue'
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/

    public async store({ request, response, auth }: HttpContextContract) {
        try {
            const payload = await request.validate(VenueValidator)

            let venue = new Venue()
            venue.name = payload.name
            venue.address = payload.address
            venue.phone = payload.phone

            const authUser = auth.user

            await authUser?.related('venues').save(venue)
            return response.created({ message: 'Success', data: venue })
        } catch (error) {
            console.log(error)
            return response.badRequest({ errors: error.messages })
        }
    }

/**
  * @swagger
  * /api/v1/venues/{id}:
  *   get:
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: number
  *           minimum: 1
  *         description: Venue ID
  *     tags:
  *       - Venues
  *     summary: Get Venue by Id
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/    

    public async show({ params, response }: HttpContextContract) {
        let { id } = params
        let venue = await Venue.findBy("id", id)
        if (venue) {
            return response.ok({ message: 'Success', data: venue })   
        }
        return response.badRequest({ message: 'No such data to show' })
    }

/**
  * @swagger
  * /api/v1/venues/{id}:
  *   put:
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: number
  *           minimum: 1
  *         description: Venue ID
  *     tags:
  *       - Venues
  *     summary: Update Venue
  *     requestBody:
  *       required: true
  *       content:
  *         application/x-www-form-urlencoded:
  *           schema:
  *             $ref: '#definitions/Venue'
  *         application/json:
  *           schema:
  *             $ref: '#definitions/Venue'
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/

    public async update({ params, request, response }: HttpContextContract) {
        const payload = await request.validate(VenueValidator)
        let { id } = params

        let venue = await Venue.findOrFail(id)
        venue.name = payload.name
        venue.address = payload.address
        venue.phone = payload.phone

        await venue.save()
        if (venue) {
            return response.ok({ message: 'Updated!', data: venue})
        }
        return response.badRequest({ message: 'No such data to update' })
    }

    public async destroy({ params, response }: HttpContextContract) {
        let { id } = params
        let venue = await Venue.findOrFail(id)
        await venue.delete()
        if (venue) {
            return response.ok({ message: 'Deleted!'})
        }
        return response.badRequest({ message: 'No such data to delete' })
    }

}
