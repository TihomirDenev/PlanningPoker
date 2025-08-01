import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { STORAGE_KEYS } from 'src/app/shared/constants/constants';
import { getLocalPlayerInfo } from 'src/app/shared/utils/room-utils';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly router = inject(Router);

  getPlayerInfo(): { id: string; name: string } {
    return getLocalPlayerInfo();
  }

  savePlayerName(name: string) {
    localStorage.setItem(STORAGE_KEYS.userName, name.trim());
  }

  async promptForName(
    openNameDialog: (title: string, initial: string) => Promise<string | null>
  ): Promise<string | null> {
    return openNameDialog('Enter your name', '');
  }

  async ensurePlayerIdentity(
    openNameDialog: (title: string, initial: string) => Promise<string | null>
  ): Promise<{ id: string; name: string }> {
    const { id, name } = this.getPlayerInfo();

    if (name) {
      return { id, name };
    }

    const enteredName = await this.promptForName(openNameDialog);

    if (!enteredName) {
      await this.router.navigate(['/']);

      return { id, name: '' };
    }
    this.savePlayerName(enteredName);
    
    return { id, name: enteredName };
  }
}
