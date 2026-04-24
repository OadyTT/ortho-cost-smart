// api/save.js — บันทึกข้อมูลลง Google Sheet sheet "บันทึก"
import { google } from 'googleapis'

const SPREADSHEET_ID = '1IivnEuLFzonKTpC8WDMkCegUnTLde4JSwKYvwU0YJeU'

const CREDENTIALS = {
  client_email: 'ortho-sheet-writer@ortho-cost-smart.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDf0aMxjnhOLwXw\n02hHYbRX/GjqoLC2FNnRF6wOuCYh2hQnFaTBq9tcm1jSm8ZHsZKvQmwEH94GbfD8\njb14Vfrxzx28cdQWqQ5GiNdhaXtP8rQa9wpr3d+dOQFSBWskKREo8gawwMC4xCZB\n9Kybxjj5/x7Gze7nGm88yxYYkzoag33iGlY8XZiWRJmBZfJ7lmXMis3AjZRJkSuI\ndBKNZhfFphELQ9cw42ggsNJj6/HwMUoprysVB1pL2vmE/Zu5J6/QsvLMZgZixFBv\nzXZfYFBKa+suEKsiHy/xYBQ+wgnlddMk3TS8YYz/0DZdkoErCFGVtGC5jNbtRDXN\n6+m6mdGHAgMBAAECggEACfrvcPqZCLt2DgVkmqeTrXIMPPIfZG8iQKhH5tF1Tysf\nR5g3zt8FRWgz72g80N5ChoggCEBiMR0z6BRrRMi+C4xLF30SklQa1oWsPPlsIzt/\npngqQcxp9+PJLZ7KO+7iMgDg0CmNg8T+A7uPpX6S9IAuH3qiqDF4kQMT9X0907LA\nowgNrJ/oPkOrOSFEQPdVrgbTwE4Uuw7KNd5PSzu7osjGJFCZyfpz6ueh19p0RFir\ncx40Wf21x7gT3B8E0XPC0+fTy/d+/w3qGUwWhvrYUh9y03ROYKiKih68rwG/N+2B\nOqYCFXhD2ZT4zinQO/O4RU2AZIJMN9FKz0W+VL7dGQKBgQD21cFnUzmIRtqvSR/n\nrXKbRe1AI7CyCbu+vGr6h8z+ycOuVucoF5XcWPOYmV6JbMrHaMIzRbhdnrAKhmwB\n97hyyXVhjPdwiBOxhRGACx0Kxvnb17e9yO+vwwNJeg8938qw0fGVheAf7fYgiZ0/\n9fBoJnxjKH2cGQT4wZmP7TRK/QKBgQDoIRtYnX11Lr8FRusjDOX5xQfctIArWuLV\nbD3nNajZG0SfSaC9tOuACh83F2k36X2Y0YqyWqXC8FdTbSlNU3kzTfcEHGyaXH5a\ne1j1gW6yBmaAQ4fd7wUdE0x0//72CnPQlBqodO9HeRdI28I8aO2cMofwTwkItgnO\nH+zTlWb/0wKBgQCCcZBV1GuREzC6dYCA5O6uFBQ/Ux0r2Wz4bYZzg5TYCTR6S765\nN02hNvj06ghFw9Kd80S959h40UXjKgqmN42oS8LWnLKfK6qMo/ANpNHiQikE/0lA\n6JGSZxKzn+eyITRyoWB0Tl2VQiJSK6eIh6ZWxA/0Lw/CkI5KD7Xhk8+Q2QKBgQCV\nRbTwJ1amJIlyO0i6IXFCTRHhO7GwL6Hu3MxyAm+yLXbTd+WGGPHYRKoOI1/mNKAv\nxZALYX92/FcrrucAcs1d0KUoX573JMOcK/Xo6nLkyHjhwot8jFgdemuQUY8DaXVQ\ni+0Ypxm4PIZcs/UUI+WorFX+ktScZXOouZ7x8QFrQQKBgFlY4d5YNrBfvUDiD/Sa\nKoyiORw8/aCUWfsieKEzFcdjRE81t9kdpVb8MyZ4E03ZyEDewTmUqA2jV1pRG65G\n1NVBo9i3TaMqX6qF4kJtKJIp1IvMZMCtDrxNc/3dM/s4w9xJMcMXb/UpduUmpdKd\npHCJGBaJZltrIVib7FWm2DCO\n-----END PRIVATE KEY-----\n',
}

const RIGHT_LABEL = {
  UC: 'บัตรทอง', A2: 'ข้าราชการ', A7: 'ประกันสังคม', stateless: 'ไร้สถานะ',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { patient, selected, total } = req.body

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // สร้าง row ที่จะบันทึก
    const itemList = selected.map(r => `${r.item.name} (x${r.qty})`).join(' | ')
    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })

    const row = [
      now,                          // A: วันที่/เวลา
      patient.name,                 // B: ชื่อ
      patient.age,                  // C: อายุ
      patient.hn,                   // D: HN
      patient.an,                   // E: AN
      RIGHT_LABEL[patient.right],   // F: สิทธิ์
      patient.diagnosis,            // G: วินิจฉัย
      itemList,                     // H: รายการวัสดุ
      total,                        // I: ส่วนเกินรวม
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'บันทึก!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
