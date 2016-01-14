module.exports = function(utils) {
  var Record, Store;
  Record = (function() {
    function Record(options) {
      this.id = options.id, this.type = options.type, this.attributes = options.attributes, this.relationships = options.relationships;
    }

    return Record;

  })();
  return Store = (function() {
    function Store(options) {
      this.reset();
    }

    Store.prototype.reset = function() {
      this.records = [];
      return this.relations = {};
    };

    Store.prototype.toModel = function(rec, type, models) {
      var base, currentModel, data, key, links, linksAttr, model, name, ref, rel, resolve;
      model = utils.clone(rec.attributes) || {};
      model.id = rec.id;
      model.type = rec.type;
      models[type] || (models[type] = {});
      (base = models[type])[name = rec.id] || (base[name] = model);
      if (rec.relationships != null) {
        ref = rec.relationships;
        for (key in ref) {
          rel = ref[key];
          data = rel.data;
          links = rel.links;
          model[key] = null;
          if (!((data != null) || (links != null))) {
            continue;
          }
          resolve = (function(_this) {
            return function(arg) {
              var id, type;
              type = arg.type, id = arg.id;
              return _this.find(type, id, models);
            };
          })(this);
          model[key] = data instanceof Array ? data.map(resolve) : data != null ? resolve(data) : {};
          currentModel = model[key];
          if (currentModel != null) {
            linksAttr = currentModel.links;
            currentModel.get = function(attrName) {
              if (attrName === 'links') {
                return linksAttr;
              } else {
                return currentModel[attrName];
              }
            };
            currentModel.links = links || {};
          }
        }
      }
      return model;
    };

    Store.prototype.findRecord = function(type, id) {
      return utils.find(this.records, function(r) {
        return r.type === type && r.id === id;
      });
    };

    Store.prototype.findRecords = function(type) {
      return utils.filter(this.records, function(r) {
        return r.type === type;
      });
    };

    Store.prototype.find = function(type, id, models) {
      var rec;
      if (models == null) {
        models = {};
      }
      rec = this.findRecord(type, id);
      if (rec == null) {
        return null;
      }
      models[type] || (models[type] = {});
      return models[type][id] || this.toModel(rec, type, models);
    };

    Store.prototype.findAll = function(type, models) {
      var recs;
      if (models == null) {
        models = {};
      }
      recs = this.findRecords(type);
      if (recs == null) {
        return [];
      }
      recs.forEach((function(_this) {
        return function(rec) {
          models[type] || (models[type] = {});
          return _this.toModel(rec, type, models);
        };
      })(this));
      return utils.values(models[type]);
    };

    Store.prototype.remove = function(type, id) {
      var records, remove;
      remove = (function(_this) {
        return function(record) {
          var index;
          index = _this.records.indexOf(record);
          if (!(index < 0)) {
            return _this.records.splice(index, 1);
          }
        };
      })(this);
      if (id != null) {
        return remove(this.findRecord(type, id));
      } else {
        records = this.findRecords(type);
        return records.map(remove);
      }
    };

    Store.prototype.sync = function(body, customModelsToReturn) {
      var models, recs, sync;
      if (customModelsToReturn == null) {
        customModelsToReturn = null;
      }
      sync = (function(_this) {
        return function(data) {
          var add;
          if (data == null) {
            return null;
          }
          add = function(obj) {
            var id, rec, type;
            type = obj.type, id = obj.id;
            _this.remove(type, id);
            rec = new Record(obj);
            _this.records.push(rec);
            return rec;
          };
          if (data instanceof Array) {
            return data.map(add);
          } else {
            return add(data);
          }
        };
      })(this);
      sync(body.included);
      recs = sync(body.data);
      if (customModelsToReturn) {
        return this.reSync(customModelsToReturn);
      }
      if (recs == null) {
        return null;
      }
      models = {};
      if (recs instanceof Array) {
        return recs.map((function(_this) {
          return function(rec) {
            return _this.toModel(rec, rec.type, models);
          };
        })(this));
      } else {
        return this.toModel(recs, recs.type, models);
      }
    };

    Store.prototype.reSync = function(models) {
      if (models instanceof Array) {
        return models.map((function(_this) {
          return function(model) {
            return _this.find(model.type, model.id);
          };
        })(this));
      } else {
        return this.find(models.type, models.id);
      }
    };

    return Store;

  })();
};
