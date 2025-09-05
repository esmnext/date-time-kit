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
`;
