import nodemailer from 'nodemailer'
import * as configs from '@/configuration/smtp'

const transporter = nodemailer.createTransport(configs[process.env.NODE_ENV])

export default transporter
