import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

/** 
*  @swagger
*  definitions:
*    OtpCode:
*      type: object
*      properties:
*        otp_code:
*          type: number
*        users_id:
*          type: number
*      required:
*        - otp_code
*        - users_id
*/

export default class OtpCode extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'otp_code' })
  public otpCode: number

  @column({ columnName: 'users_id' })
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
