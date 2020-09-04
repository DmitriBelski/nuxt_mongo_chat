export default (value, type) => {
  const now = new Date()
  const date = new Date(value)
  const second = (now.getTime() - date.getTime())/1000
  const m = date.getMinutes()
  const h = date.getHours()
  const dd = date.getDate()
  const mm = date.getMonth()
  const yy = date.getFullYear()
  const dateGap = now.getDate() - date.getDate()
  const monthGap = now.getMonth() - date.getMonth()
  const yearGap = now.getFullYear() - date.getFullYear()

  if (type === 'date') {
    return date.toLocaleDateString() // toLocaleString("ru-RU", { timeZone: 'UTC' })
  } else if (type === 'hour_minute') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  } else if (type === 'flow') { // для даты сообщений в потоке соощений
    if (dateGap == 0 && monthGap == 0 && yearGap == 0) {return 'Сегодня'}
    if (dateGap == 1 && monthGap == 0 && yearGap == 0) {return 'Вчера'}
    if ((dateGap > 1 || monthGap > 0) && yearGap == 0) {return date.toLocaleDateString('ru', { day: 'numeric', month: 'long'})}
    if (yearGap > 0) {return date.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric'})} 

  } else if (type === 'last_seen') { // под именем в баре, когда последний раз появлялся
    if (value == 'online') {return 'в сети'}
    if (second > 15768000) {return 'был(а) давно'} 
    else if (second < 60) {return 'был(а) только что'} 
    else if (second < 3600) {return `был(а) ${RuMinutes(second/60)} назад`} 
    else if (second < 43200) {return `был(а) ${RuHours(second/3600)} назад`} // меньше 12 часов назад
    else if (yearGap == 0 && monthGap == 0 && dateGap == 0) {return `был(а) сегодня в ${h + ':' + m}`} 
    else if (yearGap == 0 && monthGap == 0 && dateGap == 1) {return `был(а) вчера в ${h + ':' + twoDigit(m)}`} 
    else {return `был(а) ${twoDigit(dd) + '.' + twoDigit(mm) + '.' + twoDigit(yy)}`}

  } else if (type === 'chat_date') {
    if (yearGap == 0, monthGap == 0, dateGap == 0) {return h + ':' + twoDigit(m)} 
    else {return dd + '.' + twoDigit(mm) + '.' + twoDigit(yy)}

  } return date.toLocaleString()
}

function RuTime (a, b, c) {
  return function (value) {
    value = Math.floor(value)
    const small = value % 10
    const big = (value-small)/10
    if (big !== 1 && small == 1) {
      return value + ' ' + a
    } else if (big !== 1 && small > 1 && small < 5) {
      return value + ' ' + b
    } else {
      return value + ' ' + c
    }
  }
}
const RuMinutes = RuTime('минуту', 'минуты', 'минут')
const RuHours = RuTime('час', 'часа', 'часов')

function twoDigit (value) {
  if (value < 10) {
    return '0' + value
  } else if (value > 99) {
    return value % 100
  } else {
    return value
  }
}

