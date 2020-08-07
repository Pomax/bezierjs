module.exports = (process && process.env && process.env.CHAI_STATS_COV)
  ? require('./lib-cov/stats')
  : require('./lib/stats');
