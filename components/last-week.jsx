var api_users_endpoint = "https://smile-o-meter.herokuapp.com/users/";
var user_html = "user.html?user_id=";
var today = new Date();
today = today.toISOString().slice(0, 10);
var tempDay = new Date();
var daysSorted = [];
for(var i = 0; i < 6; i++) {
  var newDate = new Date(tempDay.setDate(tempDay.getDate() - 1));
  daysSorted.push(newDate.toISOString().slice(0, 10));
};

var UsersTableHeaderCell = React.createClass({
  render: function() {
    return (
      <th>{this.props.day}</th>
    );
  }
})

var UsersTableHeader = React.createClass({
  render: function() {
    var i = 0;
    var days = daysSorted.map(function(day) {
      i++;
      return (
        <UsersTableHeaderCell key={i} day={day} />
      );
    });
    return (
      <tr>
        <th>User</th>
        <th>{today}</th>
        {days}
      </tr>
    );
  }
})

var UsersTable = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {
    this.loadUsersFromServer();
  },
  loadUsersFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState(  {
          data: data.users
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var users = this.state.data.map(function(user) {
      return (
        <UserRow key={user.id} user_id={user.id} email={user.email} url={api_users_endpoint} />
      );
    })
    return (
      <table className="usersTable">
        <thead>
          <UsersTableHeader />
        </thead>
        <tbody>
          {users}
        </tbody>
      </table>
    );
  }
});

var UserRow = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      emotions: {}
    };
  },
  componentDidMount: function() {
    this.loadUserEmotionsFromServer();
  },
  loadUserEmotionsFromServer: function() {
    $.ajax({
      url: this.props.url + this.props.user_id + "/emotions",
      dataType: 'json',
      cache: false,
      success: function(data) {
        var emotions = {};
        for(var i in data.emotions)
          emotions[data.emotions[i].emotion_on] = data.emotions[i].status
        this.setState({
          data: data.emotions,
          emotions: emotions
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getEmotion: function(day) {
    if(typeof this.state.emotions[day] === 'undefined' || this.state.emotions[day] === null)
      return "pending";
    else
      return this.state.emotions[day];
  },
  render: function() {
    var api_emotions_endpoint = api_users_endpoint + this.props.user_id + "/emotions"
    var i = 0;
    var days = daysSorted.map(function(day) {
      i++;
      return (
        <UserCell key={i} emotion={this.getEmotion([day])} />
      );
    }.bind(this));
    return (
      <tr className="userRow">
        <td>{this.props.email}</td>
        <UserFormCell initialEmotion={this.getEmotion([today])} url={api_emotions_endpoint} />
        {days}
      </tr>
    );
  }
});

var UserCell = React.createClass({
  render: function() {
    return (
      <td><img src={'images/' + this.props.emotion + '.jpg'} width='30' height='30' /></td>
    );
  }
});

var UserFormCell = React.createClass({
  getInitialState: function() {
    return {
      emotion: ''
    };
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      emotion: nextProps.initialEmotion
    });
  },
  updateEmotionStatus: function(status) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: { emotion: { status: status, emotion_on: today}},
      success: function(data) {
        this.setState({
          emotion: status
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    if(this.state.emotion === "pending") {
      return (
        <td>
          <img src={'images/sad.jpg'}   width='30' height='30' onClick={this.updateEmotionStatus.bind(this, 'sad')} />
          <img src={'images/happy.jpg'} width='30' height='30' onClick={this.updateEmotionStatus.bind(this, 'happy')} />
        </td>
      );
    } else {
      return (
        <UserCell emotion={this.state.emotion} url={this.props.url} />
      );
    }
  }
});

ReactDOM.render(
  <UsersTable url={api_users_endpoint} />,
  document.getElementById('content')
);
