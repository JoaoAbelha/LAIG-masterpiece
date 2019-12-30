class MenuHandler {
    static init(scene) {
        this.scene = scene;
        this.scene.menuMode = true;
        CameraHandler.resetZoom();
        this.scene.camera = this.scene.menu_camera;

        let player2_computer_level_menu = new Menu (
            scene, 
            [
                () => (this.player2_difficulty = 2, this.clockSpeedMenu()),
                () => (this.player2_difficulty = 3, this.clockSpeedMenu()),
                () => (this.player2_difficulty = 4, this.clockSpeedMenu()),
            ],
            "menu/resources/player2computerlevel.png"
        );

        let player2_type_menu = new Menu (
            scene, 
            [
                () => (this.player2_difficulty = 1, this.clockSpeedMenu()),
                () => this.swapMenu(player2_computer_level_menu)
            ],
            "menu/resources/player2typemenu.png"
        );

        let player1_computer_level_menu = new Menu (
            scene, 
            [
                () => (this.player1_difficulty = 2, this.swapMenu(player2_type_menu)),
                () => (this.player1_difficulty = 3, this.swapMenu(player2_type_menu)),
                () => (this.player1_difficulty = 4, this.swapMenu(player2_type_menu)),
            ],
            "menu/resources/player1computerlevel.png"
        );

        let player1_type_menu = new Menu (
            scene, 
            [
                () => (this.player1_difficulty = 1, this.swapMenu(player2_type_menu)),
                () => this.swapMenu(player1_computer_level_menu)
            ],
            "menu/resources/player1typemenu.png"
        );


        this.menu = player1_type_menu;
    }
    
    static swapMenu(new_menu) {
        CameraHandler.menuRotation();
        setTimeout(() => {
            this.menu = new_menu;
        }, 500);
    }

    static clockSpeedMenu() {
        let clock_speed_menu = new Menu (
            this.scene, 
            [
                () => (this.clock_speed = "slow", this.initGame()),
                () => (this.clock_speed = "fast", this.initGame()),
                () => (this.clock_speed = "bullet", this.initGame()),
            ],
            "menu/resources/clockspeedmenu.png"
        );

        if (this.player1_difficulty === 1 || this.player2_difficulty === 1) {
            this.swapMenu(clock_speed_menu);
        } else {
            this.initGame();
        }
    }

    static initGame() {
        GameState.initGame(this.player1_difficulty, this.player2_difficulty, this.clock_speed);
        this.menu = null;
        this.scene.initGame();
    }

    static displayCurrentMenu() {
        this.menu && this.menu.display();
    }
}