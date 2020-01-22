'use strict'

var pageLoader = require('./pageLoader')
var cheerio = require('cheerio')
var request = require('request-promise').defaults({ simple: false })

var url = process.argv[2] || 'http://www.google.com'

const tab = []
const calendarTab = []
const paulAvailability = []
const peterAvailability = []
const maryAvailability = []
var countFri = 0
var countSat = 0
var countSun = 0
var availableDays = {}
var availableMovies = {}
const cinemaMovies = []
const cinemaDays = []

async function solution () {
  if (process.argv.length !== 3) {
    console.log('Please insert the right commands !')
  } else {
    const res = await pageLoader.fetch(url)
    let $ = cheerio.load(res)
    // get the list + their links
    $('li').each((i, el) => {
      const links = $(el).find('a').attr('href')
      tab.push(links)
    })
    console.log('Scraping links...OK')

    // CALENDAR PAGE

    // get html of Calendar link
    var calendar = tab[0]
    const resCal = await pageLoader.fetch(calendar)
    $ = cheerio.load(resCal)
    // get the li + their links for calendar page
    $('li').each((i, el) => {
      const calendarLinks = $(el).find('a').attr('href')
      calendarTab.push(calendarLinks)
    })

    // PAUL CALENDAR
    // get html of Paul's calendar
    var paul = calendarTab[0]
    var paulPage = calendar + paul

    const res1 = await pageLoader.fetch(paulPage)
    $ = cheerio.load(res1)
    // get the td
    $('td').each((i, el) => {
      const free = $(el).text()
      paulAvailability.push(free)
    })

    // CHECK AVAILABLE DAYS
    if (paulAvailability[0] === 'ok' || paulAvailability[0] === 'Ok' || paulAvailability[0] === 'OK' || paulAvailability[0] === 'oK') {
      countFri++
    }
    if (paulAvailability[1] === 'ok' || paulAvailability[1] === 'Ok' || paulAvailability[1] === 'OK' || paulAvailability[1] === 'oK') {
      countSat++
    }
    if (paulAvailability[2] === 'ok' || paulAvailability[2] === 'Ok' || paulAvailability[2] === 'OK' || paulAvailability[2] === 'oK') {
      countSun++
    }

    // PETER CALENDAR
    var peter = calendarTab[1]
    var peterPage = calendar + peter
    const res2 = await pageLoader.fetch(peterPage)
    $ = cheerio.load(res2)
    $('td').each((i, el) => {
      const free = $(el).text()
      peterAvailability.push(free)
    })

    // CHECK AVAILABLE DAYS
    if (peterAvailability[0] === 'ok' || peterAvailability[0] === 'Ok' || peterAvailability[0] === 'OK' || peterAvailability[0] === 'oK') {
      countFri++
    }
    if (peterAvailability[1] === 'ok' || peterAvailability[1] === 'Ok' || peterAvailability[1] === 'OK' || peterAvailability[1] === 'oK') {
      countSat++
    }
    if (peterAvailability[2] === 'ok' || peterAvailability[2] === 'Ok' || peterAvailability[2] === 'OK' || peterAvailability[2] === 'oK') {
      countSun++
    }

    // MARY CALENDAR
    var mary = calendarTab[2]
    var maryPage = calendar + mary
    const res3 = await pageLoader.fetch(maryPage)
    $ = cheerio.load(res3)
    $('td').each((i, el) => {
      const free = $(el).text()
      maryAvailability.push(free)
    })

    // CHECK AVAILABLE DAYS
    if (maryAvailability[0] === 'ok' || maryAvailability[0] === 'Ok' || maryAvailability[0] === 'OK' || maryAvailability[0] === 'oK') {
      countFri++
    }
    if (maryAvailability[1] === 'ok' || maryAvailability[1] === 'Ok' || maryAvailability[1] === 'OK' || maryAvailability[1] === 'oK') {
      countSat++
    }
    if (maryAvailability[2] === 'ok' || maryAvailability[2] === 'Ok' || maryAvailability[2] === 'OK' || maryAvailability[2] === 'oK') {
      countSun++
    }

    if (countFri < 3 && countSat < 3 && countSun < 3) {
      console.log('There is no available day')
      process.exit(0)
    }

    if (countFri === 3) {
      availableDays['05'] = 'Friday'
    }
    if (countSat === 3) {
      availableDays['06'] = 'Saturday'
    }
    if (countSun === 3) {
      availableDays['07'] = 'Sunday'
    }

    console.log('Scraping available days...OK')

    // CINEMA PAGE

    // get html of Cinema link
    var cinema = tab[1]
    const resCine = await pageLoader.fetch(cinema)
    $ = cheerio.load(resCine)

    $('#movie').find('option').each((i, el) => {
      const moviesTitle = $(el).text()
      cinemaMovies.push(moviesTitle)
    })

    if (cinemaMovies[1] === 'The Flying Deuces') {
      availableMovies['01'] = 'The Flying Deuces'
    }
    if (cinemaMovies[2] === 'Keep Your Seats, Please') {
      availableMovies['02'] = 'Keep Your Seats, Please'
    }
    if (cinemaMovies[3] === 'A Day at the Races') {
      availableMovies['03'] = 'A Day at the Races'
    }

    const moviesIds = ['01', '02', '03']

    $('#day').find('option').each((i, el) => {
      const days = $(el).text()
      cinemaDays.push(days)
    })

    var checkURL = ''
    var moviesAndTimes = []
    for (var i = 0; i < 3; i++) { // movies
      for (const key of Object.keys(availableDays)) {
        checkURL = cinema + '/check?day=' + key + '&movie=' + moviesIds[i]
        const resMovies = await pageLoader.fetch(checkURL)
        const json = JSON.parse(resMovies)
        for (var j = 0; j < json.length; j++) {
          if (json[j].status === 1) {
            var obj = { day: availableDays[json[j].day], movie: availableMovies[json[j].movie], movieStartTime: parseInt(json[j].time), movieEndTime: parseInt(json[j].time) + 2 }
            moviesAndTimes.push(obj)
          }
        }
      }
    }
    console.log('Scraping showtimes...OK')

    // RESTAURANT PAGE

    // get html of Restaurant link
    var restaurant = tab[2]
    const cookieJar = request.jar()

    request.post({
      headers: { 'content-type': 'application/x-www-urlencoded' },
      url: restaurant + '/login',
      form: {
        username: 'zeke',
        password: 'coys',
        submit: 'login'
      }
    }, function (err, res, body) {
      if (err) {
        console.log('ERROR POST')
      } else {
        const cookie = res.headers['set-cookie'][0]
        cookieJar.setCookie(cookie, url)

        request.get({
          headers: { cookie: cookieJar.getCookieString(restaurant + '/login') },
          url: restaurant + '/login/booking'
        }, function (err, res, body) {
          if (err) {
            console.log('ERROR GET')
          } else {
            var freeTimesResto = []
            $ = cheerio.load(body)

            $('input').filter("[name^='group1']").map(function (i, link) {
              var day = ''
              if ($(link).attr('value').substring(0, 3) === 'fri') {
                day = 'Friday'
              }
              if ($(link).attr('value').substring(0, 3) === 'sat') {
                day = 'Saturday'
              }
              if ($(link).attr('value').substring(0, 3) === 'sun') {
                day = 'Sunday'
              }
              var obj = { day: day, restoStartTime: parseInt($(link).attr('value').substring(3, 5)), restoEndTime: parseInt($(link).attr('value').substring(5)) }
              freeTimesResto.push(obj)
            })

            var result = []
            for (i = 0; i < moviesAndTimes.length; i++) {
              for (j = 0; j < freeTimesResto.length; j++) {
                if (moviesAndTimes[i].day === freeTimesResto[j].day) {
                  if (!result.includes(freeTimesResto[j])) {
                    result.push(freeTimesResto[j])
                  }
                }
              }
            }
            console.log('Scraping possible reservations...OK\n\n\n')
            console.log('Recommendations \n ================ \n')

            for (i = 0; i < moviesAndTimes.length; i++) {
              for (j = 0; j < result.length; j++) {
                if (moviesAndTimes[i].movieEndTime === result[j].restoStartTime) {
                  console.log('* On ', moviesAndTimes[i].day + ' the movie "', moviesAndTimes[i].movie +
                    '" starts at', moviesAndTimes[i].movieStartTime + ':00 and there is a free table between', result[j].restoStartTime + ':00 -'
                  , result[j].restoEndTime + ':00.')
                }
              }
            }
          }
        })
      }
    })
  }
}

solution()
