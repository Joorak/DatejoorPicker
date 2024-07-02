/*!
 * js-daterangepicker
 * version: 0.1.2
 * authors: Joorak Rezapour
 * license: MIT
 * https://joorak.com
 */
// importScripts('https://cdnjs.cloudflare.com/ajax/libs/jquery/4.0.0-beta/jquery.min.js')
// importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js')
// importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/fa.min.js')
// importScripts('https://cdnjs.cloudflare.com/ajax/libs/knockout/3.5.1/knockout-latest.js')

// import 'https://cdnjs.cloudflare.com/ajax/libs/jquery/4.0.0-beta/jquery.min.js';
// import 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js';
// import 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/fa.min.js';
// import 'https://cdnjs.cloudflare.com/ajax/libs/knockout/3.5.1/knockout-latest.js';

(function() {
  var AllTimeDateRange, ArrayUtils, CalendarHeaderView, CalendarView, Config, CustomDateRange, DateRange, DateRangePickerView, MomentIterator, MomentUtil, Period,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  MomentUtil = (function() {
    function MomentUtil() {}

    MomentUtil.patchCurrentLocale = function(obj) {
      return moment.locale(moment.locale(), obj);
    };

    MomentUtil.setFirstDayOfTheWeek = function(dow) {
      var offset;
      dow = (dow % 7 + 7) % 7;
      if (moment.localeData().firstDayOfWeek() !== dow) {
        offset = dow - moment.localeData().firstDayOfWeek();
        return this.patchCurrentLocale({
          week: {
            dow: dow,
            doy: moment.localeData().firstDayOfYear()
          }
        });
      }
    };

    MomentUtil.tz = function(input) {
      var args, timeZone;
      args = Array.prototype.slice.call(arguments, 0, -1);
      timeZone = arguments[arguments.length - 1];
      if (moment.tz) {
        return moment.tz.apply(null, args.concat([timeZone]));
      } else if (timeZone && timeZone.toLowerCase() === 'utc') {
        return moment.utc.apply(null, args);
      } else {
        return moment.apply(null, args);
      }
    };

    return MomentUtil;

  })();

  MomentIterator = (function() {
    MomentIterator.array = function(date, amount, period) {
      var i, iterator, j, ref, results;
      iterator = new this(date, period);
      results = [];
      for (i = j = 0, ref = amount - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        results.push(iterator.next());
      }
      return results;
    };

    function MomentIterator(date, period) {
      this.date = date.clone();
      this.period = period;
    }

    MomentIterator.prototype.next = function() {
      var nextDate;
      nextDate = this.date;
      this.date = nextDate.clone().add(1, this.period);
      return nextDate.clone();
    };

    return MomentIterator;

  })();

  ArrayUtils = (function() {
    function ArrayUtils() {}

    ArrayUtils.rotateArray = function(array, offset) {
      offset = offset % array.length;
      return array.slice(offset).concat(array.slice(0, offset));
    };

    ArrayUtils.uniqArray = function(array) {
      var i, j, len, newArray;
      newArray = [];
      for (j = 0, len = array.length; j < len; j++) {
        i = array[j];
        if (newArray.indexOf(i) === -1) {
          newArray.push(i);
        }
      }
      return newArray;
    };

    return ArrayUtils;

  })();

  $.fn.daterangepicker = function(options, callback) {
    if (options == null) {
      options = {};
    }
    this.each(function() {
      var $element;
      $element = $(this);
      if (!$element.data('daterangepicker')) {
        options.anchorElement = $element;
        if (callback) {
          options.callback = callback;
        }
        options.callback = $.proxy(options.callback, this);
        return $element.data('daterangepicker', new DateRangePickerView(options));
      }
    });
    return this;
  };

  ko.bindingHandlers.stopBinding = {
    init: function() {
      return {
        controlsDescendantBindings: true
      };
    }
  };

  ko.virtualElements.allowedBindings.stopBinding = true;

  ko.bindingHandlers.daterangepicker = (function() {
    return $.extend(this, {
      _optionsKey: 'daterangepickerOptions',
      _formatKey: 'daterangepickerFormat',
      init: function(element, valueAccessor, allBindings) {
        var observable, options;
        observable = valueAccessor();
        options = ko.unwrap(allBindings.get(this._optionsKey)) || {};
        return $(element).daterangepicker(options, function(startDate, endDate, period) {
          return observable([startDate, endDate]);
        });
      },
      update: function(element, valueAccessor, allBindings) {
        var $element, dateFormat, endDate, endDateText, ref, startDate, startDateText;
        $element = $(element);
        ref = valueAccessor()(), startDate = ref[0], endDate = ref[1];
        dateFormat = ko.unwrap(allBindings.get(this._formatKey)) || 'MMM D, YYYY';
        startDateText = moment(startDate).format(dateFormat);
        endDateText = moment(endDate).format(dateFormat);
        return ko.ignoreDependencies(function() {
          var text;
          if (!$element.data('daterangepicker').standalone()) {
            text = $element.data('daterangepicker').single() ? startDateText : startDateText + " – " + endDateText;
            $element.val(text).text(text);
          }
          $element.data('daterangepicker').startDate(startDate);
          return $element.data('daterangepicker').endDate(endDate);
        });
      }
    });
  })();

  DateRange = (function() {
    function DateRange(title, startDate, endDate) {
      this.title = title;
      this.startDate = startDate;
      this.endDate = endDate;
    }

    return DateRange;

  })();

  AllTimeDateRange = (function(superClass) {
    extend(AllTimeDateRange, superClass);

    function AllTimeDateRange() {
      return AllTimeDateRange.__super__.constructor.apply(this, arguments);
    }

    return AllTimeDateRange;

  })(DateRange);

  CustomDateRange = (function(superClass) {
    extend(CustomDateRange, superClass);

    function CustomDateRange() {
      return CustomDateRange.__super__.constructor.apply(this, arguments);
    }

    return CustomDateRange;

  })(DateRange);

  Period = (function() {
    function Period() {}

    Period.allPeriods = ['day', 'week', 'month', 'quarter', 'year'];

    Period.scale = function(period) {
      if (period === 'day' || period === 'week') {
        return 'month';
      } else {
        return 'year';
      }
    };

    Period.showWeekDayNames = function(period) {
      if (period === 'day' || period === 'week') {
        return true;
      } else {
        return false;
      }
    };

    Period.nextPageArguments = function(period) {
      var amount, scale;
      amount = period === 'year' ? 9 : 1;
      scale = this.scale(period);
      return [amount, scale];
    };

    Period.format = function(period) {
      switch (period) {
        case 'day':
        case 'week':
          return 'D';
        case 'month':
          return 'MMM';
        case 'quarter':
          return '\\QQ';
        case 'year':
          return 'YYYY';
      }
    };

    Period.title = function(period, calendar_type) {
      switch (period) {
        case 'day':
          if (calendar_type === 'gregorian') {
            return 'Day';
          } else {
            return 'روز';
          }
          break;
        case 'week':
          if (calendar_type === 'gregorian') {
            return 'Week';
          } else {
            return 'هفته';
          }
          break;
        case 'month':
          if (calendar_type === 'gregorian') {
            return 'Month';
          } else {
            return 'ماه';
          }
          break;
        case 'quarter':
          if (calendar_type === 'gregorian') {
            return 'Quarter';
          } else {
            return 'فصل';
          }
          break;
        case 'year':
          if (calendar_type === 'gregorian') {
            return 'Year';
          } else {
            return 'سال';
          }
      }
    };

    Period.dimentions = function(period) {
      switch (period) {
        case 'day':
          return [7, 6];
        case 'week':
          return [1, 6];
        case 'month':
          return [3, 4];
        case 'quarter':
          return [2, 2];
        case 'year':
          return [3, 3];
      }
    };

    Period.methods = ['scale', 'showWeekDayNames', 'nextPageArguments', 'format', 'title', 'dimentions'];

    Period.extendObservable = function(observable) {
      this.methods.forEach(function(method) {
        return observable[method] = function() {
          return Period[method](observable());
        };
      });
      return observable;
    };

    return Period;

  })();

  Config = (function() {
    function Config(options) {
      if (options == null) {
        options = {};
      }
      this.firstDayOfWeek = this._firstDayOfWeek(options.firstDayOfWeek);
      this.timeZone = this._timeZone(options.timeZone);
      this.periods = this._periods(options.periods);
      this.customPeriodRanges = this._customPeriodRanges(options.customPeriodRanges);
      this.period = this._period(options.period);
      this.single = this._single(options.single);
      this.opened = this._opened(options.opened);
      this.expanded = this._expanded(options.expanded);
      this.standalone = this._standalone(options.standalone);
      this.hideWeekdays = this._hideWeekdays(options.hideWeekdays);
      this.calendar_type = this._calendar_type(options.calendar_type);
      this.hideinput = this._hideinput(options.hideinput);
      this.locale = this._locale(options.locale);
      this.orientation = this._orientation(options.orientation);
      this.forceUpdate = options.forceUpdate;
      this.minDate = this._minDate(options.minDate);
      this.maxDate = this._maxDate(options.maxDate);
      this.startDate = this._startDate(options.startDate);
      this.endDate = this._endDate(options.endDate);
      this.sth = this._sth(0);
      this.ranges = this._ranges(options.ranges);
      this.isCustomPeriodRangeActive = ko.observable(false);
      this.anchorElement = this._anchorElement(options.anchorElement);
      this.parentElement = this._parentElement(options.parentElement);
      this.callback = this._callback(options.callback);
      this.callbackStartYearSelected = this._callback(options.callbackStartYearSelected);
      this.callbackEndYearSelected = this._callback(options.callbackEndYearSelected);
      this.callbackCellSelected = this._callback(options.callbackCellSelected);
      this.firstDayOfWeek.subscribe(function(newValue) {
        return MomentUtil.setFirstDayOfTheWeek(newValue);
      });
      MomentUtil.setFirstDayOfTheWeek(this.firstDayOfWeek());
    }

    Config.change_calendar_type = function(val) {
      val || (val = 'jalali');
      if (val !== 'jalali' && val !== 'gregorian') {
        throw new Error('Invalid Calendar Type, Options : [jalali, gregorian]');
      }
      window.calendar_type = val;
      if (val === 'jalali') {
        moment.locale('fa');
      }
      return ko.observable(val);
    };

    Config.prototype.extend = function(obj) {
      var k, ref, results, v;
      ref = this;
      results = [];
      for (k in ref) {
        v = ref[k];
        if (this.hasOwnProperty(k) && k[0] !== '_') {
          results.push(obj[k] = v);
        }
      }
      return results;
    };

    Config.prototype._firstDayOfWeek = function(val) {
      return ko.observable(val ? val : 0);
    };

    Config.prototype._timeZone = function(val) {
      return ko.observable(val || 'UTC');
    };

    Config.prototype._periods = function(val) {
      return ko.observableArray(val || Period.allPeriods);
    };

    Config.prototype._customPeriodRanges = function(obj) {
      var results, title, value;
      obj || (obj = {});
      results = [];
      for (title in obj) {
        value = obj[title];
        results.push(this.parseRange(value, title));
      }
      return results;
    };

    Config.prototype._period = function(val) {
      val || (val = this.periods()[0]);
      if (val !== 'day' && val !== 'week' && val !== 'month' && val !== 'quarter' && val !== 'year') {
        throw new Error('Invalid period');
      }
      return Period.extendObservable(ko.observable(val));
    };

    Config.prototype._single = function(val) {
      return ko.observable(val || false);
    };

    Config.prototype._opened = function(val) {
      return ko.observable(val || false);
    };

    Config.prototype._expanded = function(val) {
      return ko.observable(val || false);
    };

    Config.prototype._standalone = function(val) {
      return ko.observable(val || false);
    };

    Config.prototype._hideWeekdays = function(val) {
      return ko.observable(val || false);
    };

    Config.prototype._minDate = function(val) {
      var mode, ref;
      if (val instanceof Array) {
        ref = val, val = ref[0], mode = ref[1];
      }
      val || (val = moment().subtract(30, 'years'));
      return this._dateObservable(val, mode);
    };

    Config.prototype._maxDate = function(val) {
      var mode, ref;
      if (val instanceof Array) {
        ref = val, val = ref[0], mode = ref[1];
      }
      val || (val = moment().add(30, 'years'));
      return this._dateObservable(val, mode, this.minDate);
    };

    Config.prototype._startDate = function(val) {
      val || (val = moment().subtract(29, 'days'));
      return this._dateObservable(val, null, this.minDate, this.maxDate);
    };

    Config.prototype._sth = function(val) {
      return ko.observable(val || 0);
    };

    Config.prototype._endDate = function(val) {
      val || (val = moment());
      return this._dateObservable(val, null, this.startDate, this.maxDate);
    };

    Config.prototype._ranges = function(obj) {
      var results, title, value;
      obj || (obj = this._defaultRanges());
      if (!$.isPlainObject(obj)) {
        throw new Error('Invalid ranges parameter (should be a plain object)');
      }
      results = [];
      for (title in obj) {
        value = obj[title];
        switch (value) {
          case 'all-time':
            results.push(new AllTimeDateRange(title, this.minDate().clone(), this.maxDate().clone()));
            break;
          case 'custom':
            results.push(new CustomDateRange(title));
            break;
          default:
            results.push(this.parseRange(value, title));
        }
      }
      return results;
    };

    Config.prototype.parseRange = function(value, title) {
      var endDate, from, startDate, to;
      if (!Array.isArray(value)) {
        throw new Error('Value should be an array');
      }
      startDate = value[0], endDate = value[1];
      if (!startDate) {
        throw new Error('Missing start date');
      }
      if (!endDate) {
        throw new Error('Missing end date');
      }
      from = MomentUtil.tz(startDate, this.timeZone());
      to = MomentUtil.tz(endDate, this.timeZone());
      if (!from.isValid()) {
        throw new Error('Invalid start date');
      }
      if (!to.isValid()) {
        throw new Error('Invalid end date');
      }
      return new DateRange(title, from, to);
    };

    Config.prototype._locale = function(val) {
      var applyButtonTitle, cancelButtonTitle, endLabel, startLabel;
      applyButtonTitle = 'Apply';
      cancelButtonTitle = 'Cancel';
      startLabel = 'Start';
      endLabel = 'End';
      if (this.calendar_type() === 'jalali') {
        applyButtonTitle = 'قبول';
        cancelButtonTitle = 'انصراف';
        startLabel = 'شروع';
        endLabel = 'پایان';
      }
      return $.extend({
        applyButtonTitle: applyButtonTitle,
        cancelButtonTitle: cancelButtonTitle,
        inputFormat: 'L',
        startLabel: startLabel,
        endLabel: endLabel
      }, val || {});
    };

    Config.prototype._hideinput = function(val) {
      val || (val = false);
      return ko.observable(val);
    };

    Config.prototype._calendar_type = function(val) {
      val || (val = 'jalali');
      if (val !== 'jalali' && val !== 'gregorian') {
        throw new Error('Invalid Calendar Type, Options : [jalali, gregorian]');
      }
      window.calendar_type = val;
      if (val === 'jalali') {
        moment.locale('fa');
      }
      return ko.observable(val);
    };

    Config.prototype._orientation = function(val) {
      val || (val = 'right');
      if (val !== 'right' && val !== 'left') {
        throw new Error('Invalid orientation');
      }
      return ko.observable(val);
    };

    Config.prototype._dateObservable = function(val, mode, minBoundary, maxBoundary) {
      var computed, fitMax, fitMin, observable;
      observable = ko.observable();
      computed = ko.computed({
        read: function() {
          return observable();
        },
        write: (function(_this) {
          return function(newValue) {
            var oldValue;
            newValue = computed.fit(newValue);
            oldValue = observable();
            if (!(oldValue && newValue.isSame(oldValue))) {
              return observable(newValue);
            }
          };
        })(this)
      });
      computed.mode = mode || 'inclusive';
      fitMin = (function(_this) {
        return function(val) {
          var min;
          if (minBoundary) {
            min = minBoundary();
            switch (minBoundary.mode) {
              case 'extended':
                min = min.clone().startOf(_this.period());
                break;
              case 'exclusive':
                min = min.clone().endOf(_this.period()).add(1, 'millisecond');
            }
            val = moment.max(min, val);
          }
          return val;
        };
      })(this);
      fitMax = (function(_this) {
        return function(val) {
          var max;
          if (maxBoundary) {
            max = maxBoundary();
            switch (maxBoundary.mode) {
              case 'extended':
                max = max.clone().endOf(_this.period());
                break;
              case 'exclusive':
                max = max.clone().startOf(_this.period()).subtract(1, 'millisecond');
            }
            val = moment.min(max, val);
          }
          return val;
        };
      })(this);
      computed.fit = (function(_this) {
        return function(val) {
          val = MomentUtil.tz(val, _this.timeZone());
          return fitMax(fitMin(val));
        };
      })(this);
      computed(val);
      computed.clone = (function(_this) {
        return function() {
          return _this._dateObservable(observable(), computed.mode, minBoundary, maxBoundary);
        };
      })(this);
      computed.isWithinBoundaries = (function(_this) {
        return function(date) {
          var between, max, maxExclusive, min, minExclusive, per, sameMax, sameMin;
          per = _this.period();
          if (window.calendar_state_year) {
            per = "year";
          }
          date = MomentUtil.tz(date, _this.timeZone());
          min = minBoundary();
          max = maxBoundary();
          between = date.isBetween(min, max, per);
          if (per === 'quarter' && calendar_type === 'jalali') {
            between = date.isBetween(min, max, 'month');
          }
          sameMin = date.isSame(min, per);
          sameMax = date.isSame(max, per);
          if (per === 'quarter' && calendar_type === 'jalali') {
            sameMin = date.isSame(min, 'month');
            sameMax = date.isSame(max, 'month');
          }
          minExclusive = minBoundary.mode === 'exclusive';
          maxExclusive = maxBoundary.mode === 'exclusive';
          return between || (!minExclusive && sameMin && !(maxExclusive && sameMax)) || (!maxExclusive && sameMax && !(minExclusive && sameMin));
        };
      })(this);
      if (minBoundary) {
        computed.minBoundary = minBoundary;
        minBoundary.subscribe(function() {
          return computed(observable());
        });
      }
      if (maxBoundary) {
        computed.maxBoundary = maxBoundary;
        maxBoundary.subscribe(function() {
          return computed(observable());
        });
      }
      return computed;
    };

    Config.prototype._defaultRanges = function() {
      if (calendar_type === 'jalali') {
        return {
          '30 روز گذشته': [moment().subtract(29, 'days'), moment()],
          '90 روز گذشته': [moment().subtract(89, 'days'), moment()],
          'سال قبل': [moment().subtract(1, 'year').add(1, 'day'), moment()],
          'بازه دلخواه': 'custom'
        };
      } else {
        return {
          'Last 30 days': [moment().subtract(29, 'days'), moment()],
          'Last 90 days': [moment().subtract(89, 'days'), moment()],
          'Last Year': [moment().subtract(1, 'year').add(1, 'day'), moment()],
          'Custom Range': 'custom'
        };
      }
    };

    Config.prototype._anchorElement = function(val) {
      var direction, direction_;
      direction = 'right';
      direction_ = val.css('direction');
      if (direction_ === 'ltr') {
        direction = 'left';
      }
      return $(val);
    };

    Config.prototype._parentElement = function(val) {
      return $(val || (this.standalone() ? this.anchorElement : 'body'));
    };

    Config.prototype._callback = function(val) {
      if (val && !(typeof val === "function")) {
        throw new Error('Invalid callback (not a function)');
      }
      return val;
    };

    return Config;

  })();

  CalendarHeaderView = (function() {
    function CalendarHeaderView(calendarView) {
      this.clickNextButton = bind(this.clickNextButton, this);
      this.clickPrevButton = bind(this.clickPrevButton, this);
      this.clickSelectYear = bind(this.clickSelectYear, this);
      this.currentDate = calendarView.currentDate;
      this.period = calendarView.period;
      this.timeZone = calendarView.timeZone;
      this.firstDate = calendarView.firstDate;
      this.firstYearOfDecade = calendarView.firstYearOfDecade;
      this.setActiveDate = calendarView.setActiveDate;
      this.CalendarStateYear = false;
      this.type = calendarView.type;
      this.callbackStartYearSelected = calendarView.callbackStartYearSelected;
      this.callbackEndYearSelected = calendarView.callbackEndYearSelected;
      this.startDate = calendarView.startDate;
      this.endDate = calendarView.endDate;
      this.prevDate = ko.pureComputed((function(_this) {
        return function() {
          var amount, period, ref;
          ref = _this.period.nextPageArguments(), amount = ref[0], period = ref[1];
          return _this.currentDate().clone().subtract(amount, period);
        };
      })(this));
      this.nextDate = ko.pureComputed((function(_this) {
        return function() {
          var amount, dt, period, ref;
          ref = _this.period.nextPageArguments(), amount = ref[0], period = ref[1];
          dt = _this.currentDate().clone().add(amount, period);
          return dt;
        };
      })(this));
      this.selectedMonth = ko.computed({
        read: (function(_this) {
          return function() {
            return _this.currentDate().month();
          };
        })(this),
        write: (function(_this) {
          return function(newValue) {
            var newDate;
            newDate = _this.currentDate().clone().month(newValue);
            if (!newDate.isSame(_this.currentDate(), 'month')) {
              return _this.currentDate(newDate);
            }
          };
        })(this),
        pure: true
      });
      this.selectedYear = ko.computed({
        read: (function(_this) {
          return function() {
            return _this.currentDate().year();
          };
        })(this),
        write: (function(_this) {
          return function(newValue) {
            var newDate;
            newDate = _this.currentDate().clone().year(newValue);
            if (!newDate.isSame(_this.currentDate(), 'year')) {
              return _this.currentDate(newDate);
            }
          };
        })(this),
        pure: true
      });
      this.selectedDecade = ko.computed({
        read: (function(_this) {
          return function() {
            return _this.firstYearOfDecade(_this.currentDate()).year();
          };
        })(this),
        write: (function(_this) {
          return function(newValue) {
            var newDate, newYear, offset;
            offset = (_this.currentDate().year() - _this.selectedDecade()) % 9;
            newYear = newValue + offset;
            newDate = _this.currentDate().clone().year(newYear);
            if (!newDate.isSame(_this.currentDate(), 'year')) {
              return _this.currentDate(newDate);
            }
          };
        })(this),
        pure: true
      });
    }

    CalendarHeaderView.prototype.clickSelectYear = function(obj) {
      var new_d, old_d;
      window.calendar_state_year = true;
      old_d = this.currentDate().clone();
      new_d = this.currentDate().clone().subtract(1, 'years');
      this.currentDate(new_d);
      return this.currentDate(old_d);
    };

    CalendarHeaderView.prototype.clickPrevButton = function() {
      var prev;
      prev = this.prevDate();
      return this.currentDate(prev);
    };

    CalendarHeaderView.prototype.clickNextButton = function() {
      var next;
      next = this.nextDate();
      return this.currentDate(next);
    };

    CalendarHeaderView.prototype.prevArrowCss = function() {
      var date, ref;
      date = this.firstDate().clone().subtract(1, 'millisecond');
      if ((ref = this.period()) === 'day' || ref === 'week') {
        date = date.endOf('month');
      }
      return {
        'arrow-hidden': !this.currentDate.isWithinBoundaries(date)
      };
    };

    CalendarHeaderView.prototype.nextArrowCss = function() {
      var cols, date, ref, ref1, rows;
      ref = this.period.dimentions(), cols = ref[0], rows = ref[1];
      date = this.firstDate().clone().add(cols * rows, this.period());
      if ((ref1 = this.period()) === 'day' || ref1 === 'week') {
        date = date.startOf('month');
      }
      return {
        'arrow-hidden': !this.currentDate.isWithinBoundaries(date)
      };
    };

    CalendarHeaderView.prototype.monthOptions = function() {
      var j, maxMonth, minMonth, results;
      minMonth = this.currentDate.minBoundary().isSame(this.currentDate(), 'year') ? this.currentDate.minBoundary().month() : 0;
      maxMonth = this.currentDate.maxBoundary().isSame(this.currentDate(), 'year') ? this.currentDate.maxBoundary().month() : 11;
      return (function() {
        results = [];
        for (var j = minMonth; minMonth <= maxMonth ? j <= maxMonth : j >= maxMonth; minMonth <= maxMonth ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this);
    };

    CalendarHeaderView.prototype.yearOptions = function() {
      var j, ref, ref1, results, x;
      x = (function() {
        results = [];
        for (var j = ref = this.currentDate.minBoundary().year(), ref1 = this.currentDate.maxBoundary().year(); ref <= ref1 ? j <= ref1 : j >= ref1; ref <= ref1 ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this);
      return x;
    };

    CalendarHeaderView.prototype.decadeOptions = function() {
      var res;
      res = ArrayUtils.uniqArray(this.yearOptions().map((function(_this) {
        return function(year) {
          var momentObj;
          momentObj = MomentUtil.tz(year + "/01/01", _this.timeZone());
          return _this.firstYearOfDecade(momentObj).year();
        };
      })(this)));
      return res;
    };

    CalendarHeaderView.prototype.monthSelectorAvailable = function() {
      var ref;
      return (ref = this.period()) === 'day' || ref === 'week';
    };

    CalendarHeaderView.prototype.yearSelectorAvailable = function() {
      return this.period() !== 'year';
    };

    CalendarHeaderView.prototype.decadeSelectorAvailable = function() {
      return this.period() === 'year';
    };

    CalendarHeaderView.prototype.monthFormatter = function(x) {
      if (window.calendar_type === 'jalali') {
        return moment.utc("1401/" + (x + 1) + "/01").format('MMMM');
      } else {
        return moment.utc("2005/" + (x + 1) + "/01").format('MMMM');
      }
    };

    CalendarHeaderView.prototype.yearFormatter = function(x) {
      return x;
    };

    CalendarHeaderView.prototype.decadeFormatter = function(from) {
      var cols, ref, rows, to;
      ref = Period.dimentions('year'), cols = ref[0], rows = ref[1];
      to = from + cols * rows - 1;
      return from + " – " + to;
    };

    return CalendarHeaderView;

  })();

  CalendarView = (function() {
    function CalendarView(mainView, dateSubscribable, type, sth) {
      this.cssForDate = bind(this.cssForDate, this);
      this.eventsForDate = bind(this.eventsForDate, this);
      this.cellClickEvent = bind(this.cellClickEvent, this);
      this.formatDateTemplate = bind(this.formatDateTemplate, this);
      this.tableValues = bind(this.tableValues, this);
      this.inRange = bind(this.inRange, this);
      this.setActiveDate = bind(this.setActiveDate, this);
      this.period = mainView.period;
      this.single = mainView.single;
      this.timeZone = mainView.timeZone;
      this.locale = mainView.locale;
      this.startDate = mainView.startDate;
      this.endDate = mainView.endDate;
      this.calendar_type = mainView.calendar_type();
      this.isCustomPeriodRangeActive = mainView.isCustomPeriodRangeActive;
      this.callbackStartYearSelected = mainView.callbackStartYearSelected;
      this.callbackEndYearSelected = mainView.callbackEndYearSelected;
      this.callbackCellSelected = mainView.callbackCellSelected;
      this.type = type;
      this.label = mainView.locale[type + "Label"] || '';
      this.hoverDate = ko.observable(null);
      this.activeDate = dateSubscribable;
      this.currentDate = dateSubscribable.clone();
      this.sth = sth;
      this.counter = ko.observable(0);
      this.inputDate = ko.computed({
        read: (function(_this) {
          return function() {
            return (_this.hoverDate() || _this.activeDate()).format(_this.locale.inputFormat);
          };
        })(this),
        write: (function(_this) {
          return function(newValue) {
            var newDate;
            newDate = MomentUtil.tz(newValue, _this.locale.inputFormat, _this.timeZone());
            if (newDate.isValid()) {
              return _this.activeDate(newDate);
            }
          };
        })(this),
        pure: true
      });
      this.firstDate = ko.pureComputed((function(_this) {
        return function() {
          var date, firstDayOfMonth;
          date = _this.currentDate().clone().startOf(_this.period.scale());
          switch (_this.period()) {
            case 'day':
            case 'week':
              firstDayOfMonth = date.clone();
              date.weekday(0);
              if (date.isAfter(firstDayOfMonth) || date.isSame(firstDayOfMonth, 'day')) {
                date.subtract(1, 'week');
              }
              break;
            case 'year':
              date = _this.firstYearOfDecade(date);
          }
          return date;
        };
      })(this));
      this.activeDate.subscribe((function(_this) {
        return function(newValue) {
          return _this.currentDate(newValue);
        };
      })(this));
      this.headerView = new CalendarHeaderView(this);
    }

    CalendarView.prototype.setActiveDate = function(date) {};

    CalendarView.prototype.calendar = function() {
      var col, cols, date, dt, i, iterator, j, l, per, ref, ref1, ref2, results, results1, row, rows;
      ref = this.period.dimentions(), cols = ref[0], rows = ref[1];
      if (this.period() === "quarter" && calendar_type === "jalali" && !window.calendar_state_year) {
        date = this.firstDate().clone().add(3, "month");
        i = -1;
        results = [];
        for (row = j = 1, ref1 = rows; 1 <= ref1 ? j <= ref1 : j >= ref1; row = 1 <= ref1 ? ++j : --j) {
          results.push((function() {
            var l, ref2, results1;
            results1 = [];
            for (col = l = 1, ref2 = cols; 1 <= ref2 ? l <= ref2 : l >= ref2; col = 1 <= ref2 ? ++l : --l) {
              i = i + 1;
              dt = this.firstDate().clone().add(i * 3, "month");
              if (this.type === 'end') {
                dt = dt.clone().add(2, "month").endOf('month');
              } else {
                dt = dt.startOf('month');
              }
              results1.push(dt);
            }
            return results1;
          }).call(this));
        }
        return results;
      } else {
        per = this.period();
        if (window.calendar_state_year) {
          per = "year";
          rows = 3;
          cols = 3;
        }
        iterator = new MomentIterator(this.firstDate(), per);
        results1 = [];
        for (row = l = 1, ref2 = rows; 1 <= ref2 ? l <= ref2 : l >= ref2; row = 1 <= ref2 ? ++l : --l) {
          results1.push((function() {
            var n, ref3, results2;
            results2 = [];
            for (col = n = 1, ref3 = cols; 1 <= ref3 ? n <= ref3 : n >= ref3; col = 1 <= ref3 ? ++n : --n) {
              date = iterator.next();
              if (this.type === 'end') {
                results2.push(date.endOf(per));
              } else {
                results2.push(date.startOf(per));
              }
            }
            return results2;
          }).call(this));
        }
        return results1;
      }
    };

    CalendarView.prototype.weekDayNames = function() {
      var first_day_of_week;
      first_day_of_week = moment.localeData().firstDayOfWeek();
      if (calendar_type === "jalali") {
        first_day_of_week = first_day_of_week + 1;
      }
      return ArrayUtils.rotateArray(moment.weekdaysMin(), first_day_of_week);
    };

    CalendarView.prototype.inRange = function(date) {
      if (calendar_type === 'jalali' && this.period() === 'quarter') {
        return date.isAfter(this.startDate(), 'month') && date.isBefore(this.endDate(), 'month') || (date.isSame(this.startDate(), 'month') || date.isSame(this.endDate(), 'month'));
      } else {
        return date.isAfter(this.startDate(), this.period()) && date.isBefore(this.endDate(), this.period()) || (date.isSame(this.startDate(), this.period()) || date.isSame(this.endDate(), this.period()));
      }
    };

    CalendarView.prototype.tableValues = function(date) {
      var format, m, months, quarter, quarter_text, yyyy;
      format = this.period.format();
      switch (this.period()) {
        case 'day':
        case 'month':
        case 'year':
          m = [
            {
              html: date.format(format)
            }
          ];
          if (window.calendar_state_year) {
            return [
              {
                html: date.format("YYYY"),
                css: {
                  unavailable: false
                }
              }
            ];
          } else {
            return m;
          }
          break;
        case 'week':
          date = date.clone().startOf(this.period());
          return MomentIterator.array(date, 7, 'day').map((function(_this) {
            return function(date) {
              return {
                html: date.format(format),
                css: {
                  'week-day': true,
                  unavailable: _this.cssForDate(date, true).unavailable
                }
              };
            };
          })(this));
        case 'quarter':
          yyyy = date.format("YYYY");
          quarter = date.format(format);
          quarter_text = quarter;
          date = date.clone().startOf('quarter');
          months = [];
          if (calendar_type === 'jalali') {
            if (quarter === 'Q1') {
              quarter_text = 'بهار';
            }
            if (quarter === 'Q2') {
              quarter_text = 'تابستان';
            }
            if (quarter === 'Q3') {
              quarter_text = 'پاییز';
            }
            if (quarter === 'Q4') {
              quarter_text = 'زمستان';
            }
          } else {
            months = MomentIterator.array(date, 3, 'month').map(function(date) {
              return date.format('MMM');
            });
          }
          if (window.calendar_state_year) {
            return [
              {
                html: yyyy,
                css: {
                  unavailable: false
                }
              }
            ];
          } else {
            return [
              {
                html: "<span>" + quarter_text + "</span><br><span class='months'>" + (months.join(", ")) + "</span>"
              }
            ];
          }
      }
    };

    CalendarView.prototype.formatDateTemplate = function(date) {
      return {
        nodes: $("<div>" + (this.formatDate(date)) + "</div>").children()
      };
    };

    CalendarView.prototype.cellClickEvent = function(item, event) {
      var arr, cnt, curr, newArr, tbl;
      curr = jQuery(event.target);
      if (curr.hasClass("table-value") || curr.is("span")) {
        cnt = curr.text();
      } else {
        tbl = curr.find(".table-value");
        cnt = tbl.text();
      }
      if (window.calendar_state_year) {
        return this.callbackCellSelected(cnt, "year", this.type);
      } else {
        if (this.period() === 'week') {
          arr = curr.parent().find(".week-day");
          newArr = [];
          arr.each((function(_this) {
            return function(index, it) {
              return newArr.push(parseInt($(it).text()));
            };
          })(this));
          cnt = newArr;
        }
        return this.callbackCellSelected(cnt, this.period(), this.type);
      }
    };

    CalendarView.prototype.eventsForDate = function(date) {
      return {
        click: (function(_this) {
          return function() {
            var old_period;
            if (window.calendar_state_year) {
              window.calendar_state_year = false;
              if (_this.activeDate.isWithinBoundaries(date)) {
                _this.activeDate(date);
              }
              old_period = _this.period();
              _this.period("year");
              return _this.period(old_period);
            } else {
              if (_this.activeDate.isWithinBoundaries(date)) {
                return _this.activeDate(date);
              }
            }
          };
        })(this),
        mouseenter: (function(_this) {
          return function() {
            if (_this.activeDate.isWithinBoundaries(date)) {
              return _this.hoverDate(_this.activeDate.fit(date));
            }
          };
        })(this),
        mouseleave: (function(_this) {
          return function() {
            return _this.hoverDate(null);
          };
        })(this)
      };
    };

    CalendarView.prototype.cssForDate = function(date, periodIsDay) {
      var differentMonth, inRange, obj1, onRangeEnd, per, ret, withinBoundaries;
      per = this.period();
      if (window.calendar_state_year) {
        per = "year";
      }
      onRangeEnd = date.isSame(this.activeDate(), per);
      withinBoundaries = this.activeDate.isWithinBoundaries(date);
      periodIsDay || (periodIsDay = per === 'day');
      differentMonth = !date.isSame(this.currentDate(), 'month');
      inRange = this.inRange(date);
      ret = (
        obj1 = {
          "in-range": !this.single() && (inRange || onRangeEnd)
        },
        obj1[this.type + "-date"] = onRangeEnd,
        obj1["clickable"] = withinBoundaries && !this.isCustomPeriodRangeActive(),
        obj1["out-of-boundaries"] = !withinBoundaries || this.isCustomPeriodRangeActive(),
        obj1["unavailable"] = periodIsDay && differentMonth,
        obj1
      );
      return ret;
    };

    CalendarView.prototype.firstYearOfDecade = function(date) {
      var currentYear, firstYear, offset, year;
      currentYear = MomentUtil.tz(moment(), this.timeZone()).year();
      firstYear = currentYear - 4;
      offset = Math.floor((date.year() - firstYear) / 9);
      year = firstYear + offset * 9;
      return MomentUtil.tz(year + "/01/01", this.timeZone());
    };

    return CalendarView;

  })();

  DateRangePickerView = (function() {
    function DateRangePickerView(options) {
      var endDate, ref, startDate, wrapper;
      if (options == null) {
        options = {};
      }
      this.outsideClick = bind(this.outsideClick, this);
      this.setCustomPeriodRange = bind(this.setCustomPeriodRange, this);
      this.setDateRange = bind(this.setDateRange, this);
      new Config(options).extend(this);
      this.startCalendar = new CalendarView(this, this.startDate, 'start', this.sth);
      this.endCalendar = new CalendarView(this, this.endDate, 'end', this.sth);
      this.startDateInput = this.startCalendar.inputDate;
      this.endDateInput = this.endCalendar.inputDate;
      this.dateRange = ko.observable([this.startDate(), this.endDate()]);
      this.sth.subscribe((function(_this) {
        return function(newValue) {
          return _this.startDate(_this.startDate().add(1, "years"));
        };
      })(this));
      this.startDate.subscribe((function(_this) {
        return function(newValue) {
          if (_this.single()) {
            _this.endDate(newValue.clone().endOf(_this.period()));
            _this.updateDateRange();
            return _this.close();
          } else {
            if (_this.endDate().isSame(newValue)) {
              _this.endDate(_this.endDate().clone().endOf(_this.period()));
            }
            if (_this.standalone()) {
              return _this.updateDateRange();
            }
          }
        };
      })(this));
      this.endDate.subscribe((function(_this) {
        return function(newValue) {
          if (!_this.single() && _this.standalone()) {
            return _this.updateDateRange();
          }
        };
      })(this));
      this.style = ko.observable({});
      if (this.callback) {
        this.dateRange.subscribe((function(_this) {
          return function(newValue) {
            var endDate, startDate;
            startDate = newValue[0], endDate = newValue[1];
            return _this.callback(startDate.clone(), endDate.clone(), _this.period());
          };
        })(this));
        if (this.forceUpdate) {
          ref = this.dateRange(), startDate = ref[0], endDate = ref[1];
          this.callback(startDate.clone(), endDate.clone(), this.period());
        }
      }
      if (this.anchorElement) {
        wrapper = $("<div data-bind=\"stopBinding: true\"></div>").appendTo(this.parentElement);
        this.containerElement = $(this.constructor.template).appendTo(wrapper);
        ko.applyBindings(this, this.containerElement.get(0));
        this.anchorElement.click((function(_this) {
          return function() {
            _this.updatePosition();
            return _this.toggle();
          };
        })(this));
        if (!this.standalone()) {
          $(document).on('mousedown.daterangepicker', this.outsideClick).on('touchend.daterangepicker', this.outsideClick).on('click.daterangepicker', '[data-toggle=dropdown]', this.outsideClick).on('focusin.daterangepicker', this.outsideClick);
        }
      }
      if (this.opened()) {
        this.updatePosition();
      }
    }

    DateRangePickerView.prototype.periodProxy = Period;

    DateRangePickerView.prototype.calendars = function() {
      if (this.single()) {
        return [this.startCalendar];
      } else {
        return [this.startCalendar, this.endCalendar];
      }
    };

    DateRangePickerView.prototype.updateDateRange = function() {
      return this.dateRange([this.startDate(), this.endDate()]);
    };

    DateRangePickerView.prototype.calendar_type = function() {
      return this.calendar_type();
    };

    DateRangePickerView.prototype.visibility_inputs = function() {
      var s;
      s = "";
      if (this.hideinput()) {
        s = "visibility_inputs_none";
      }
      return s;
    };

    DateRangePickerView.prototype.cssClasses = function() {
      var direction, direction_, j, len, obj, period, ref;
      direction = 'right';
      direction_ = this.anchorElement.css('direction');
      if (direction_ === 'ltr') {
        direction = 'left';
      }
      obj = {
        single: this.single(),
        opened: this.standalone() || this.opened(),
        expanded: this.standalone() || this.single() || this.expanded(),
        standalone: this.standalone(),
        'calendar-type-jalali': this.calendar_type() === 'jalali',
        'calendar-type-gregorian': this.calendar_type() === 'gregorian',
        'hide-weekdays': this.hideWeekdays(),
        'hide-periods': (this.periods().length + this.customPeriodRanges.length) === 1,
        'orientation-left': direction === 'left',
        'orientation-right': direction === 'right'
      };
      ref = Period.allPeriods;
      for (j = 0, len = ref.length; j < len; j++) {
        period = ref[j];
        obj[period + "-period"] = period === this.period();
      }
      return obj;
    };

    DateRangePickerView.prototype.isActivePeriod = function(period) {
      return this.period() === period;
    };

    DateRangePickerView.prototype.isActiveDateRange = function(dateRange) {
      var dr, j, len, ref;
      if (dateRange.constructor === CustomDateRange) {
        ref = this.ranges;
        for (j = 0, len = ref.length; j < len; j++) {
          dr = ref[j];
          if (dr.constructor !== CustomDateRange && this.isActiveDateRange(dr)) {
            return false;
          }
        }
        return true;
      } else {
        return this.startDate().isSame(dateRange.startDate, 'day') && this.endDate().isSame(dateRange.endDate, 'day');
      }
    };

    DateRangePickerView.prototype.isActiveCustomPeriodRange = function(customPeriodRange) {
      return this.isActiveDateRange(customPeriodRange) && this.isCustomPeriodRangeActive();
    };

    DateRangePickerView.prototype.inputFocus = function() {
      var periods;
      periods = this.periods();
      if (periods.length > 0) {
        if (periods[0] === 'month') {
          this.setPeriod('month');
        }
      }
      return this.expanded(true);
    };

    DateRangePickerView.prototype.setPeriod = function(period) {
      this.isCustomPeriodRangeActive(false);
      this.period(period);
      return this.expanded(true);
    };

    DateRangePickerView.prototype.setDateRange = function(dateRange) {
      var periods;
      if (dateRange.constructor === CustomDateRange) {
        periods = this.periods();
        if (periods.length > 0) {
          if (periods[0] === 'month') {
            this.setPeriod('month');
          }
        }
        return this.expanded(true);
      } else {
        this.expanded(false);
        this.close();
        this.period('day');
        periods = this.periods();
        if (periods.length > 0) {
          if (periods[0] === 'month') {
            this.setPeriod('month');
          }
        }
        this.startDate(dateRange.startDate);
        this.endDate(dateRange.endDate);
        return this.updateDateRange();
      }
    };

    DateRangePickerView.prototype.setCustomPeriodRange = function(customPeriodRange) {
      this.isCustomPeriodRangeActive(true);
      return this.setDateRange(customPeriodRange);
    };

    DateRangePickerView.please_applyChanges = function() {
      return DateRangePickerView.prototype.updatePosition();
    };

    DateRangePickerView.prototype.applyChanges = function() {
      this.close();
      return this.updateDateRange();
    };

    DateRangePickerView.prototype.cancelChanges = function() {
      return this.close();
    };

    DateRangePickerView.prototype.open = function() {
      return this.opened(true);
    };

    DateRangePickerView.prototype.close = function() {
      if (!this.standalone()) {
        return this.opened(false);
      }
    };

    DateRangePickerView.prototype.toggle = function() {
      if (this.opened()) {
        return this.close();
      } else {
        return this.open();
      }
    };

    DateRangePickerView.prototype.updatePosition = function() {
      var parentOffset, parentRightEdge, style;
      if (this.standalone()) {
        return;
      }
      parentOffset = {
        top: 0,
        left: 0
      };
      parentRightEdge = $(window).width();
      if (!this.parentElement.is('body')) {
        parentOffset = {
          top: this.parentElement.offset().top - this.parentElement.scrollTop(),
          left: this.parentElement.offset().left - this.parentElement.scrollLeft()
        };
        parentRightEdge = this.parentElement.get(0).clientWidth + this.parentElement.offset().left;
      }
      style = {
        top: (this.anchorElement.offset().top + this.anchorElement.outerHeight() - parentOffset.top) + 'px',
        left: 'auto',
        right: 'auto'
      };
      switch (this.orientation()) {
        case 'left':
          if (this.containerElement.offset().left < 0) {
            style.left = '9px';
          } else {
            style.right = (parentRightEdge - (this.anchorElement.offset().left) - this.anchorElement.outerWidth()) + 'px';
          }
          break;
        default:
          if (this.containerElement.offset().left + this.containerElement.outerWidth() > $(window).width()) {
            style.right = '0';
          } else {
            style.left = (this.anchorElement.offset().left - parentOffset.left) + 'px';
          }
      }
      return this.style(style);
    };

    DateRangePickerView.prototype.outsideClick = function(event) {
      var target;
      target = $(event.target);
      if (!(event.type === 'focusin' || target.closest(this.anchorElement).length || target.closest(this.containerElement).length || target.closest('.calendar').length)) {
        return this.close();
      }
    };

    return DateRangePickerView;

  })();

  DateRangePickerView.template = '<div class="daterangepicker" data-bind="css: $data.cssClasses(), style: $data.style()"> <div class="controls"> <ul class="periods"> <!-- ko foreach: $data.periods --> <li class="period" data-bind="css: {period_month: $data == `month`, active: $parent.isActivePeriod($data) && !$parent.isCustomPeriodRangeActive()}, text: $parent.periodProxy.title($data, $parent.calendar_type()), click: function(){ $parent.setPeriod($data); }"></li> <!-- /ko --> <!-- ko foreach: $data.customPeriodRanges --> <li class="period" data-bind="css: {active: $parent.isActiveCustomPeriodRange($data)}, text: $data.title, click: function(){ $parent.setCustomPeriodRange($data); }"></li> <!-- /ko --> </ul> <ul class="ranges" data-bind="foreach: $data.ranges"> <li class="range" data-bind="css: {active: $parent.isActiveDateRange($data)}, text: $data.title, click: function(){ $parent.setDateRange($data); }"></li> </ul> <form data-bind="submit: $data.applyChanges"> <div class="custom-range-inputs" data-bind="css: $data.visibility_inputs()"> <input type="text" class="vazirmatn" data-bind="value: $data.startDateInput, event: {focus: $data.inputFocus}" /> <input type="text" class="vazirmatn" data-bind="value: $data.endDateInput, event: {focus: $data.inputFocus}" /> </div> <div class="custom-range-buttons"> <button class="apply-btn vazirmatn" type="submit" data-bind="text: $data.locale.applyButtonTitle, click: $data.applyChanges"></button> <button class="cancel-btn vazirmatn" data-bind="text: $data.locale.cancelButtonTitle, click: $data.cancelChanges"></button> </div> </form> </div> <!-- ko foreach: $data.calendars() --> <div class="calendar"> <div class="calendar-title" data-bind="text: $data.label"></div> <div class="calendar-header" data-bind="with: $data.headerView"> <div class="arrow" data-bind="css: $data.nextArrowCss()"> <button class="vazirmatn" data-bind="click: $data.clickNextButton"><span class="arrow-left"></span></button> </div> <div class="calendar-selects"> <select class="month-select vazirmatn" data-bind="options: $data.monthOptions(), optionsText: $data.monthFormatter, valueAllowUnset: true, value: $data.selectedMonth, css: {hidden: !$data.monthSelectorAvailable()}"></select> <!--          <select class="year-select vazirmatn" data-bind="options: $data.yearOptions(), optionsText: $data.yearFormatter, valueAllowUnset: true, value: $data.selectedYear, css: {hidden: !$data.yearSelectorAvailable()}"></select>--> <span class="year-select-label"> <span data-bind="text: $data.selectedYear, click: function(data, e) { $data.clickSelectYear(e.target) }"></span> </span> <select style="display: none" class="decade-select vazirmatn" data-bind="options: $data.decadeOptions(), optionsText: $data.decadeFormatter, valueAllowUnset: true, value: $data.selectedDecade, css: {hidden: !$data.decadeSelectorAvailable()}"></select> </div> <div class="arrow" data-bind="css: $data.prevArrowCss()"> <button class="vazirmatn" data-bind="click: $data.clickPrevButton"><span class="arrow-right"></span></button> </div> </div> <div class="calendar-table"> <!-- ko if: $parent.periodProxy.showWeekDayNames($data.period()) --> <div class="table-row weekdays" data-bind="foreach: $data.weekDayNames()"> <div class="table-col"> <div class="table-value-wrapper"> <div class="table-value" data-bind="text: $data"></div> </div> </div> </div> <!-- /ko --> <!-- ko foreach: $data.calendar() --> <div class="table-row" data-bind="foreach: $data"> <div class="table-col" data-bind="event: $parents[1].eventsForDate($data), css: $parents[1].cssForDate($data)"> <div class="table-value-wrapper" data-bind="click: $parents[1].cellClickEvent,foreach: $parents[1].tableValues($data)"> <div class="table-value" data-bind="html: $data.html, css: $data.css"></div> </div> </div> </div> <!-- /ko --> </div> </div> <!-- /ko --> </div>';

  $.extend($.fn.daterangepicker, {
    ArrayUtils: ArrayUtils,
    MomentIterator: MomentIterator,
    MomentUtil: MomentUtil,
    Period: Period,
    Config: Config,
    DateRange: DateRange,
    AllTimeDateRange: AllTimeDateRange,
    CustomDateRange: CustomDateRange,
    DateRangePickerView: DateRangePickerView,
    CalendarView: CalendarView,
    CalendarHeaderView: CalendarHeaderView
  });

}).call(this);
