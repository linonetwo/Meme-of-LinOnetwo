/*\

用评分 JSON 和意义之塔节点上的元信息，乘以从 Google Calendar 导入的事件，得到每日评分。

<<生成每日评价 date:"2020-05-05" >>

\*/
(function () {
  function getScoreOfTag(tagName) {
    const GoogleCalendar类别分值 = JSON.parse($tw.wiki.getTiddlerText('每日评价/GoogleCalendar类别分值'));
    if (tagName in GoogleCalendar类别分值) {
      return GoogleCalendar类别分值[tagName];
    }
    return null;
  }

  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }
  Date.prototype.toYearMonthDayString = function toYearMonthDayString() {
    return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate());
  };
  const dayLength = new Date(new Date().setHours(24)) - new Date(new Date().setHours(0));

  exports.name = '生成每日评价';

  // 默认是东八区的今天凌晨
  exports.params = [{ name: 'date', default: new Date(new Date().setHours(8)).toYearMonthDayString() }];

  exports.run = (date) => {
    // 获取含有 startdate 的 tiddler，因为 TiddlyWiki 的 day filter 不支持 ISO 时间戳所以我们只好自己筛选
    const todayTiddlers = $tw.wiki
      .filterTiddlers('[tag[GoogleCalendar]has[startdate]]')
      .map((title) => $tw.wiki.getTiddler(title))
      // 筛选出开始时间大于 date 的事件，注意东八区
      .filter((tiddler) => new Date(tiddler.fields.startdate) > new Date(date).setHours(0))
      .sort((a, b) => new Date(a.fields.startdate) - new Date(b.fields.startdate));

    // 计算分数
    const scores = todayTiddlers.map((tiddler) => {
      const scoreOfTags = tiddler.fields.tags
        .map((tagName) => getScoreOfTag(tagName.split('/').slice(-1)[0]))
        .filter((score) => Number.isFinite(score));

      const ScoreSumOfTags = scoreOfTags.reduce((a, b) => a + b, 0);
      // 用事件的长度来加权
      const weightOfEvent = (new Date(tiddler.fields.enddate) - new Date(tiddler.fields.startdate)) / dayLength;
      return ScoreSumOfTags * weightOfEvent;
    });

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return averageScore ? `${(averageScore * 100).toFixed(2)}%` : '0%';
  };
})();
