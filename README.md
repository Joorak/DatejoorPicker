# DatejoorPicker
configurable datepicker component that can use as inputdate or inputrangedate, also configurable for persian and gregorian calendars.

![DatejoorPicker](https://github.com/Joorak/DatejoorPicker/assets/32602338/729631ef-97f6-48d7-8f16-bd4d6747068b)

## PreRequests
1. https://cdnjs.cloudflare.com/ajax/libs/jquery/x.x.x/jquery.min.js"
2. https://cdnjs.cloudflare.com/ajax/libs/moment.js/x.x.x/moment.min.js
3. https://cdn.jsdelivr.net/npm/jalali-moment@x.x.x/dist/jalali-moment.browser.js
4. https://cdnjs.cloudflare.com/ajax/libs/knockout/x.x.x/knockout-latest.min.js

## Configuration
#### timeZone
Sets time zone. If you want to use user's computer time zone, pass null. By default, it's UTC. If you want to use other time zones you will need moment.timezone library.

timeZone: String

Default:

timeZone: 'utc'

Examples:

timeZone: 'Australia/Sydney'
timeZone: null // user's computer time zone

### firstDayOfWeek
Sets first day of the week. 0 is Sunday, 1 is Monday. In case you were wondering, 4 is Thursday.

firstDayOfWeek: Number
Important: this setting will globally change moment.js locale

Default:

firstDayOfWeek: 1 // Monday

### minDate
Sets a minimum possible date a user can select.

minDate: [(moment.js-compatible object), ('inclusive' | 'exclusive' | 'expanded')]
By default, that means you can select days (weeks, months, etc) that are the same as minDate or after minDate — this is what we call inclusive mode. In exclusive you can't select days (weeks, months, etc) that fall on minDate. When you select a month (week, quarter, etc) in expanded mode and minDate falls on the middle of the month, the first day of the month will be selected.

For example, if minDate is 14th of February, period is set to month and you click on February, the new startDate is:

inclusive mode: 14th of February;
exclusive mode: You won't be able to select February, minimum available date will be March 1st;
expanded mode: 1st of February.

Default:

minDate: [moment().subtract(30, 'years'), 'inclusive']

Examples:

minDate: '2015-11-10' // mode defaults to inclusive
minDate: moment().subtract(2, 'years')
minDate: ['2015-11-10', 'expanded']
minDate: ['2015-11-10', 'exclusive']
minDate: [null, 'exclusive'] // date defaults to moment().subtract(2, 'years')

### maxDate
Sets a maximum possible date a user can select.

maxDate: [(moment.js-compatible object), ('inclusive' | 'exclusive' | 'expanded')]
By default, that means you can select days (weeks, months, etc) that are the same as maxDate or after maxDate — this is what we call inclusive mode. In exclusive you can't select days (weeks, months, etc) that fall on maxDate. When you select a month (week, quarter, etc) in expanded mode and maxDate falls on the middle of the month, the last day of the month will be selected.

For example, if maxDate is 14th of February, period is set to month and you click on February, the new startDate is:

inclusive mode: 14th of February;
exclusive mode: You won't be able to select February, maximum available date will be January 31st;
expanded mode: 28th of February.

Default:

maxDate: [moment(), 'inclusive']

Examples:

maxDate: '2015-11-10' // mode defaults to inclusive
maxDate: moment().add(2, 'years')
maxDate: ['2015-11-10', 'expanded']
maxDate: ['2015-11-10', 'exclusive']
maxDate: [null, 'exclusive'] // date defaults to moment().subtract(2, 'years')

### startDate
This parameter sets the initial value for start date.

startDate: (moment.js-compatible object)

Default:

startDate: moment().subtract(29, 'days')

Examples:

startDate: new Date()
startDate: '2015-11-10'
startDate: [2015, 11, 10]
startDate: 1449159600
startDate: moment().subtract(1, 'week')

### endDate
This parameter sets the initial value for end date.

endDate: (moment.js-compatible object)

Default:

endDate: moment()

Examples:

endDate: new Date()
endDate: '2015-11-10'
endDate: [2015, 11, 10]
endDate: 1449159600
endDate: moment().add(1, 'week')

### ranges
Sets predefined date ranges a user can select from.

ranges: Object

Default:

{
  'Last 30 days': [moment().subtract(29, 'days'), moment()]
  'Last 90 days': [moment().subtract(89, 'days'), moment()]
  'Last Year': [moment().subtract(1, 'year').add(1,'day'), moment()]
  'All Time': 'all-time' // [minDate, maxDate]
  'Custom Range': 'custom'
}

Examples:

ranges: {
  'Last 245 Days': [moment().subtract(244, 'days'), moment()]
  'Last 3 Years': [moment().subtract(3, 'years').add(1, 'day'), moment()]
}

### period
This parameter sets the initial value for period.

period: ('day' | 'week' | 'month' | 'quarter' | 'year')

Default:

period: @periods[0]

### periods
Array of available periods. Period selector disappears if only one period specified.

periods: String[]

### single
single: Boolean

Default:

single: false

### orientation
orientation: ('left' | 'right')
Sets the side to which daterangepicker opens.

Default:

orientation: 'left'

### opened
opened: Boolean
By default, daterangepicker is hidden and you need to click the anchorElement to open it. This option allows you to make it opened on initialization.

Default:

opened: false

### expanded
expanded: Boolean
By default, when you open daterangepicker you only see predefined ranges. This option allows you to make it expanded on initialization.

Default:

expanded: false

### standalone
standalone: Boolean
Set standalone to true to append daterangepicker to anchorElement.

Default:

standalone: false

### hideWeekdays
hideWeekdays: Boolean
Set hideWeekdays to true to hide week days in day & week modes.

Default:

hideWeekdays: false

### anchorElement
anchorElement: (jQuery-compatible object)
Allows you to set anchor element for daterangepicker.

Examples:

anchorElement: '.daterange-field'
anchorElement: $('.daterange-field')
anchorElement: document.querySelector('.daterange-field')

### parentElement
parentElement: (jQuery-compatible object)
Allows you to set parent element for daterangepicker.

Default:

parentElement: document.body

Examples:

parentElement: '.daterangepicker-container'
parentElement: $('.daterangepicker-container')
parentElement: document.querySelector('.daterangepicker-container')

### forceUpdate
forceUpdate: Boolean
Immediately invokes callback after constructing daterangepicker.

Default:

forceUpdate: false

### callbacks
```
callback: function (startDate, endDate, period) {
        if(!$(this).single) {
          $(this).val(startDate.format('LL'));
          return;
        }
        var title = "";
        switch (period) {
          case 'day':
            title = startDate.format('LL') + (endDate ? ' -' + endDate.format('MMMM YYYY') : '');
            break;
          case 'week':
            title = startDate.format('MMMM YYYY') + ' - ' + endDate.format('MMMM YYYY');
            break;
          case 'month':
            title = startDate.format('MMMM YYYY') + ' - ' + endDate.format('MMMM YYYY');
            break;
          case 'quarter':
            title = ["spring", "summer", "autumn", "winter"][startDate.quarter()-1] + ' ' + startDate.format('YYYY') + ' - ' + ["spring", "summer", "autumn", "winter"][endDate.quarter()-1] + ' ' + endDate.format('YYYY');
            break;
          default:
            title = startDate.format('YYYY') + ' - ' + endDate.format('YYYY');
            break;
        }
        $(this).val(title);
      }
      ,
      callbackCellSelected: function (cellText, period, calendar_type) {
        if($(this).single)
          $(this).val(cellText);
      }
```
