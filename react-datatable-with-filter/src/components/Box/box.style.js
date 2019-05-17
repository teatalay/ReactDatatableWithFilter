import styled from 'styled-components';
import { palette } from 'styled-theme';

const BoxWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid ${palette('border', 0)};
  margin: 0 0 30px;

  &:last-child {
    margin-bottom: 0;
  }

  @media only screen and (max-width: 767px) {
    padding: 20px;
    ${'' /* margin: 0 10px 30px; */};
  }

  &.half {
    width: calc(50% - 34px);
    @media (max-width: 767px) {
      width: 100%;
    }
  }
  
  &.indexBox{
    padding:0;
    border:none;
  }
`;

const IndexBox = styled.div`
    width:100%;
    padding: 10px 0 0 20px;
    background-color: #edf0f3;
    
    h3{
      display:inline-block;
      &.index-box-title{
        color:#FFF;
        padding: 0 7px;
        font-weight:600;
        margin-right:10px;
        border-radius: 50%;
        background-color: #5f5d5f;
      }
    }
`;

export { BoxWrapper , IndexBox };
