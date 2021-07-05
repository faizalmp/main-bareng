import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Field from './Field'

/** 
*  @swagger
*  definitions:
*    Venue:
*      type: object
*      properties:
*        name:
*          type: string
*        phone:
*          type: string
*        address:
*          type: string
*      required:
*        - name
*        - phone
*        - address
*/

export default class Venue extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public phone: string

  @column()
  public address: string

  @column({ columnName: 'users_id' })
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Field)
  public fields: HasMany<typeof Field>
}
