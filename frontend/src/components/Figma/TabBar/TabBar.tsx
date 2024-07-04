import { memo } from 'react';
import type { FC } from 'react';

import resets from '../_resets.module.css';
import { AccountStrokeIconIcon } from './AccountStrokeIconIcon';
import { ButtonShapeIcon } from './ButtonShapeIcon';
import { HomeStrokeIconIcon } from './HomeStrokeIconIcon';
import { MessageSolidIconIcon } from './MessageSolidIconIcon';
import { SearchIconIcon } from './SearchIconIcon';
import classes from './TabBar.module.css';

interface Props {
  className?: string;
}
/* @figmaId 4:397 */
export const TabBar: FC<Props> = memo(function TabBar(props = {}) {
  return (
    <div className={`${resets.clapyResets} ${classes.root}`}>
      <div className={classes.background}></div>
      <div className={classes.buttonShape}>
        <ButtonShapeIcon className={classes.icon} />
      </div>
      <div className={classes.homeStrokeIcon}>
        <HomeStrokeIconIcon className={classes.icon2} />
      </div>
      <div className={classes.home}>Home</div>
      <div className={classes.searchIcon}>
        <SearchIconIcon className={classes.icon3} />
      </div>
      <div className={classes.shopNow}>Shop</div>
      <div className={classes.messageSolidIcon}>
        <MessageSolidIconIcon className={classes.icon4} />
      </div>
      <div className={classes.inbox}>Inbox</div>
      <div className={classes.accountStrokeIcon}>
        <AccountStrokeIconIcon className={classes.icon5} />
      </div>
      <div className={classes.me}>Me</div>
    </div>
  );
});
