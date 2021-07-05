import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

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
