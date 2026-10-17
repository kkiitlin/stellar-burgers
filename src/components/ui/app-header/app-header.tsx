import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { NavLink } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => (
  <header className={styles.header}>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        <NavLink
          to={'/'}
          end
          className={({ isActive }) =>
            `text text_type_main-default mr-10 ${styles.link}${
              isActive ? ` ${styles.link_active}` : ''
            }`
          }
        >
          <BurgerIcon type={'primary'} />
          <p className="ml-2">Конструктор</p>
        </NavLink>
        <NavLink
          to={'/feed'}
          className={({ isActive }) =>
            `text text_type_main-default ${styles.link}${
              isActive ? ` ${styles.link_active}` : ''
            }`
          }
        >
          <ListIcon type={'primary'} />
          <p className="ml-2">Лента заказов</p>
        </NavLink>
      </div>
      <div className={styles.logo}>
        <Logo className="" />
      </div>
      <NavLink
        to={'/profile'}
        className={({ isActive }) =>
          `text text_type_main-default ${styles.link_position_last} ${styles.link}${
            isActive ? ` ${styles.link_active}` : ''
          }`
        }
      >
        <ProfileIcon type={'primary'} />
        <p className="ml-2">{userName ?? 'Личный кабинет'}</p>
      </NavLink>
    </nav>
  </header>
);
