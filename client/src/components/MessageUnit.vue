<template>
  <div class="chat">
    <div class="chat-history">
      <ul v-if="messages">
        <li v-for="msg in messages" :key="msg.sender" class="clearfix">
          <div :class="selfUserName===msg.sender? 'align-right message-data': 'message-data'">
              <span class="message-data-time"> {{msg.time}}</span> &nbsp; &nbsp;
              <span class="message-data-name">{{ msg.sender }}</span>
              <i class="fa fa-circle me"></i>
          </div>
          <div :class="selfUserName===msg.sender? 'message my-message float-right': 'message other-message'">
            {{ msg.content }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "MessageUnit",
  props: {
    messages: Array,
    selfUserName: String
  },
  watch: {
    messages(){
      let chatBox = document.querySelector('.chat');
      chatBox.scrollTo(0, chatBox.scrollHeight)
    }
  },
  mounted(){
    console.log("Messages: ", this.messages, "\tUserName: ", this.selfUserName)
  }
}
</script>

<style lang="css" scoped>
@import url(https://fonts.googleapis.com/css?family=Lato:400,700);
ul {
  list-style-type: none;
}

.chat {
  margin-top: 5rem;
}

.chat .chat-history .message-data {
  margin-bottom: 15px;
}

.chat .chat-history .message-data-time {
  color: #a8aab1;
  padding-left: 6px;
}

.chat .chat-history .message {
  color: white;
  padding: 18px 20px;
  line-height: 26px;
  font-size: 16px;
  border-radius: 7px;
  margin-bottom: 30px;
  width: 90%;
  position: relative;
}

.chat .chat-history .message:after {
  bottom: 100%;
  left: 93%;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
  border: 10px solid transparent;
  border-bottom-color: #3E6189;
  margin-left: -10px;
}

.chat .chat-history .my-message {
  background: #3E6189;
}

.chat .chat-history .other-message {
  background: #202C37;
}

.chat .chat-history .other-message:after {
  border-bottom-color: #202C37;
  left: 7%;
}

.chat .chat-message {
  padding: 30px;
}

.chat .chat-message textarea {
  width: 100%;
  border: none;
  padding: 10px 20px;
  font: 14px/22px "Lato", Arial, sans-serif;
  margin-bottom: 10px;
  border-radius: 5px;
  resize: none;
}

.chat .chat-message .fa-file-o, .chat .chat-message .fa-file-image-o {
  font-size: 16px;
  color: gray;
  cursor: pointer;
}

.chat .chat-message button {
  float: right;
  color: #DA5B0B;
  font-size: 16px;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  font-weight: bold;
  background: #f2f5f8;
}

.chat .chat-message button:hover {
  color: #5A2504;
}

.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}

.align-left {
  text-align: left;
}

.align-right {
  text-align: right;
}

</style>