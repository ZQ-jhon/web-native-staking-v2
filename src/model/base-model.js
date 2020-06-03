/**
 * 给所有的 Model 扩展功能
 * http://mongoosejs.com/docs/plugins.html
 */
const tools = require("./tools");

module.exports = function baseModel(schema) {
  schema.methods.createAtAgo = function createAtAgo() {
    return tools.formatDate(this.createAt, true);
  };

  schema.methods.updateAtAgo = function updateAtAgo() {
    return tools.formatDate(this.updateAt, true);
  };
};
