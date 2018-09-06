import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { selectApd } from '../actions/apd';
import Btn from '../components/Btn';
import Icon, {
  faArrowRight,
  faCheckCircle,
  faCircle,
  faEdit,
  faSpinner
} from '../components/Icons';

const ProgressDot = ({ done, started, text }) => {
  let color = '#aaaaaa';
  if (done) {
    color = '#9dd887';
  } else if (started) {
    color = '#124f81';
  }

  let labelColor = '';
  if (!done && !started) {
    labelColor = ' light gray';
  }

  return (
    <div className="center">
      <Icon icon={done ? faCheckCircle : faCircle} color={color} size="2x" />
      <div className={`absolute pl1 ${labelColor}`}>{text}</div>
    </div>
  );
};

ProgressDot.propTypes = {
  done: PropTypes.bool,
  started: PropTypes.bool,
  text: PropTypes.bool
};

ProgressDot.defaultProps = {
  done: false,
  started: false,
  text: null
};

const ProgressLine = ({ done }) => (
  <div
    className={`flex-auto bg-${done ? 'blue' : 'gray'}`}
    style={{ height: '3px' }}
  />
);

ProgressLine.propTypes = {
  done: PropTypes.bool
};

ProgressLine.defaultProps = {
  done: false
};

const DocumentItem = ({ name, status, buttonClick }) => {
  const states = {
    one: {
      done: false,
      started: true,
      title: 'Submitted'
    },
    two: {
      done: false,
      started: false,
      title: 'Reviewed'
    },
    three: {
      done: false,
      started: false,
      title: 'Approved'
    }
  };

  let actionButtonText = 'View';
  let actionButtonIcon = faArrowRight;

  switch (status) {
    case 'draft':
      states.one.title = 'Drafting';
      actionButtonText = 'Open';
      actionButtonIcon = faEdit;
      break;

    case 'in review':
      states.one.done = true;
      states.two.started = true;
      states.two.title = 'Reviewing';
      break;

    case 'reviewed':
      states.one.done = true;
      states.two.done = true;
      break;

    case 'approved':
      states.one.done = true;
      states.two.done = true;
      states.three.done = true;
      actionButtonText = 'Approval letter';
      break;

    default:
      break;
  }

  return (
    <Fragment>
      <div className="sm-flex items-center justify-between mb4 pb4">
        <div className="bold sm-col-2">{name}</div>
        <div className="sm-col-7 flex items-center">
          <ProgressDot
            started={states.one.started}
            done={states.one.done}
            text={states.one.title}
          />
          <ProgressLine done={states.one.done} />
          <ProgressDot
            started={states.two.started}
            done={states.two.done}
            text={states.two.title}
          />
          <ProgressLine done={states.two.done} />
          <ProgressDot
            started={states.three.started}
            done={states.three.done}
            text={states.three.title}
          />
        </div>
        <div className="sm-col-2 sm-right-align">
          <Btn
            size="small"
            extraCss="col-8 p1 bg-blue white"
            onClick={buttonClick}
          >
            {actionButtonText} <Icon icon={actionButtonIcon} className="ml1" />
          </Btn>
        </div>
      </div>
    </Fragment>
  );
};

DocumentItem.propTypes = {
  name: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  buttonClick: PropTypes.func
};

DocumentItem.defaultProps = {
  buttonClick: () => {}
};

class CurrentDocuments extends Component {
  open = id => () => this.props.selectApd(id);

  render() {
    const { apds, fetching } = this.props;

    if (fetching) {
      return (
        <div className="h2 center">
          <Icon icon={faSpinner} spin size="sm" className="mr1" /> Loading APDs
        </div>
      );
    }

    return (
      <div>
        {apds.map(apd => (
          <DocumentItem
            key={apd.id}
            name={`APD for ${apd.years.join(', ')}`}
            status={apd.status}
            buttonClick={this.open(apd.id)}
          />
        ))}
        <DocumentItem name="Example one" status="reviewed" />
        <DocumentItem name="Example two" status="in review" />
        <DocumentItem name="Example three" status="approved" />
      </div>
    );
  }
}

CurrentDocuments.propTypes = {
  apds: PropTypes.array.isRequired,
  fetching: PropTypes.bool.isRequired,
  selectApd: PropTypes.func.isRequired
};

const mapStateToProps = ({ apd: { byId, fetching } }) => ({
  apds: Object.values(byId),
  fetching
});
const mapDispatchToProps = { selectApd };

export default connect(mapStateToProps, mapDispatchToProps)(CurrentDocuments);
