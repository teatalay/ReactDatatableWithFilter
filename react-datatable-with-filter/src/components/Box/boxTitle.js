import React from 'react';
import { BoxTitle, BoxSubTitle } from './boxTitle.style';
import Block from '../Block';

export default props => {
  return (
    <Block>
      {props.title
        ? <BoxTitle className="isoBoxTitle">
            {' '}{props.title}{' '}
          </BoxTitle>
        : ''}
      {props.subtitle
        ? <BoxSubTitle className="isoBoxSubTitle">
            {' '}{props.subtitle}{' '}
          </BoxSubTitle>
        : ''}
    </Block>
  );
};
