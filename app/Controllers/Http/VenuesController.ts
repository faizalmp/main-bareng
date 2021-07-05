import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VenueValidator from 'App/Validators/VenueValidator'
import Venue from 'App/Models/Venue'

export default class VenuesController {

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

    public async show({ params, response }: HttpContextContract) {
        let { id } = params
        let venue = await Venue.findBy("id", id)
        if (venue) {
            return response.ok({ message: 'Success', data: venue })   
        }
        return response.badRequest({ message: 'No such data to show' })
    }

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
