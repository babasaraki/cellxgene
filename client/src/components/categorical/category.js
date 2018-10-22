import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { FaChevronRight, FaChevronDown, FaPaintBrush } from "react-icons/fa";
import memoize from "memoize-one";

import * as globals from "../../globals";
import Value from "./value";
import alphabeticallySortedValues from "./util";

const countCategories = (values, optsAsBools) =>
  _.reduce(
    values,
    (r, v, k) => {
      r.total += 1;
      if (optsAsBools[k]) {
        r.on += 1;
      }
      return r;
    },
    { total: 0, on: 0 }
  );

@connect(state => ({
  colorAccessor: state.controls.colorAccessor,
  categoricalAsBooleansMap: state.controls.categoricalAsBooleansMap
}))
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: true,
      isExpanded: false
    };
    this.countCategories = memoize((values, optsAsBools) =>
      countCategories(values, optsAsBools)
    );
  }

  componentDidUpdate() {
    const { categoricalAsBooleansMap, metadataField, values } = this.props;
    const categoryCount = this.countCategories(
      values,
      categoricalAsBooleansMap[metadataField]
    );
    if (categoryCount.on === categoryCount.total) {
      /* everything is on, so not indeterminate */
      this.checkbox.indeterminate = false;
    } else if (categoryCount.on === 0) {
      /* nothing is on, so no */
      this.checkbox.indeterminate = false;
    } else if (categoryCount.on < categoryCount.total) {
      /* to be explicit... */
      this.checkbox.indeterminate = true;
    }
  }

  handleColorChange() {
    const { dispatch, metadataField } = this.props;
    dispatch({
      type: "color by categorical metadata",
      colorAccessor: metadataField
    });
  }

  toggleAll() {
    const { dispatch, metadataField } = this.props;
    dispatch({
      type: "categorical metadata filter all of these",
      metadataField
    });
    this.setState({ isChecked: true });
  }

  toggleNone() {
    const { dispatch, metadataField, value } = this.props;
    dispatch({
      type: "categorical metadata filter none of these",
      metadataField,
      value
    });
    this.setState({ isChecked: false });
  }

  handleToggleAllClick() {
    const { isChecked } = this.state;
    // || this.checkbox.indeterminate === false
    if (isChecked) {
      this.toggleNone();
    } else if (!isChecked) {
      this.toggleAll();
    }
  }

  renderCategoryItems() {
    const { values, metadataField } = this.props;
    return _.map(alphabeticallySortedValues(values), (v, i) => (
      <Value
        key={v}
        metadataField={metadataField}
        count={values[v]}
        value={v}
        i={i}
      />
    ));
  }

  render() {
    const { isExpanded, isChecked } = this.state;
    const { metadataField, colorAccessor, isTruncated } = this.props;
    return (
      <div
        style={{
          // display: "flex",
          // alignItems: "baseline",
          maxWidth: globals.maxControlsWidth
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "baseline"
          }}
        >
          <label className="bp3-control bp3-checkbox">
            <input
              onChange={this.handleToggleAllClick.bind(this)}
              ref={el => {
                this.checkbox = el;
                return el;
              }}
              checked={isChecked}
              type="checkbox"
            />
            <span className="bp3-control-indicator" />
            {""}
          </label>

          <span
            style={{
              cursor: "pointer",
              display: "inline-block"
            }}
            onClick={() => {
              this.setState({ isExpanded: !isExpanded });
            }}
          >
            {metadataField}
            {isExpanded ? (
              <FaChevronDown style={{ fontSize: 10, marginLeft: 5 }} />
            ) : (
              <FaChevronRight style={{ fontSize: 10, marginLeft: 5 }} />
            )}
          </span>

          <span
            onClick={this.handleColorChange.bind(this)}
            style={{
              marginLeft: 4,
              color:
                colorAccessor === metadataField ? globals.brightBlue : "black",
              display: "inline-block",
              cursor: "pointer"
            }}
          >
            <FaPaintBrush style={{ fontSize: 12, marginLeft: 10 }} />
          </span>
        </div>
        <div style={{ marginLeft: 26 }}>{isExpanded ? this.renderCategoryItems() : null}</div>
        <div>
          {isExpanded && isTruncated ? (
            <p style={{ paddingLeft: 15 }}>... truncated list ...</p>
          ) : null}
        </div>
      </div>
    );
  }
}

export default Category;
