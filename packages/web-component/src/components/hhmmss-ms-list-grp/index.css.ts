import { css } from '../../utils';

export default css`
:host {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}

.cols {
  flex: 1;
  display: flex;
  flex-direction: row;
  height: 0;
  justify-content: space-between;
  gap: 2px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col > span {
  text-align: center;
  display: inline-block;
  line-height: 27px;
}

dt-num-list {
  flex: 1;
}

.ms-input {
  width: 100%;
  border: 1px solid #0003;
  border-radius: 6px;
  padding: 4px;
  cursor: text;
}

label > span {
  display: inline-block;
  line-height: 1;
  font-size: 14px;
  margin-bottom: 2px;
}

input {
  width: 100%;
  padding: 0;
  border: none;
  outline: none;
}

input::placeholder {
  color: #999;
}
`;
