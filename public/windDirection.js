 (function (global) {

    "use strict";

    class WindDirection {

        constructor(canvas, parameters = {}) {

            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");

            this.size = parameters.size || 240;

            this.frameDesign = parameters.frameDesign || "tilted";
            this.background = parameters.background || "#f4f0e6";

            this.pointerColorLatest =
                parameters.pointerColorLatest || "#d71920";

            this.pointerColorAverage =
                parameters.pointerColorAverage || "#2468d8";

            this.latest = 0;
            this.average = 0;

            this.titleString =
                parameters.titleString || "DIREZIONE VENTO";

            this.lcdTitleStrings =
                parameters.lcdTitleStrings || ["Latest", "Average"];

            this.animationTime =
                parameters.fullScaleDeflectionTime || 2.5;

            this.canvas.width = this.size;
            this.canvas.height = this.size;

            this.center = this.size / 2;

            this.resize();

            this.draw();
        }


        /* =====================================================
           RESIZE
        ===================================================== */

        resize() {

            const dpr = window.devicePixelRatio || 1;

            this.canvas.width = this.size * dpr;
            this.canvas.height = this.size * dpr;

            this.canvas.style.width = this.size + "px";
            this.canvas.style.height = this.size + "px";

            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }


        /* =====================================================
           NORMALIZZAZIONE ANGOLO
        ===================================================== */

        normalizeAngle(value) {

            value = parseFloat(value);

            if (!Number.isFinite(value)) {
                return 0;
            }

            value %= 360;

            if (value < 0) {
                value += 360;
            }

            return value;
        }


        /* =====================================================
           ANGOLO PIÙ BREVE
        ===================================================== */

        shortestAngle(from, to) {

            let difference = (to - from + 540) % 360 - 180;

            return difference;
        }


        /* =====================================================
           SET LATEST
        ===================================================== */

        setValueLatest(value) {

            this.latest = this.normalizeAngle(value);

            this.draw();

            return this;
        }


        /* =====================================================
           SET AVERAGE
        ===================================================== */

        setValueAverage(value) {

            this.average = this.normalizeAngle(value);

            this.draw();

            return this;
        }


        /* =====================================================
           ANIMAZIONE LATEST
        ===================================================== */

        setValueAnimatedLatest(value, callback) {

            const target = this.normalizeAngle(value);

            this.animatePointer(
                "latest",
                target,
                callback
            );

            return this;
        }


        /* =====================================================
           ANIMAZIONE AVERAGE
        ===================================================== */

        setValueAnimatedAverage(value, callback) {

            const target = this.normalizeAngle(value);

            this.animatePointer(
                "average",
                target,
                callback
            );

            return this;
        }


        /* =====================================================
           ANIMAZIONE
        ===================================================== */

        animatePointer(type, target, callback) {

            const start =
                type === "latest"
                    ? this.latest
                    : this.average;

            const difference =
                this.shortestAngle(start, target);

            const duration =
                Math.max(
                    250,
                    this.animationTime *
                    1000 *
                    Math.abs(difference) / 180
                );

            const startTime = performance.now();

            const animate = (now) => {

                const elapsed =
                    now - startTime;

                let progress =
                    Math.min(elapsed / duration, 1);

                // Ease in/out
                progress =
                    progress < 0.5
                        ? 2 * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const value =
                    start + difference * progress;

                if (type === "latest") {
                    this.latest = this.normalizeAngle(value);
                } else {
                    this.average = this.normalizeAngle(value);
                }

                this.draw();

                if (progress < 1) {

                    requestAnimationFrame(animate);

                } else {

                    if (type === "latest") {
                        this.latest = target;
                    } else {
                        this.average = target;
                    }

                    this.draw();

                    if (typeof callback === "function") {
                        callback();
                    }
                }
            };

            requestAnimationFrame(animate);
        }


        /* =====================================================
           DISEGNO GENERALE
        ===================================================== */

        draw() {

            const ctx = this.ctx;
            const s = this.size;
            const c = this.center;

            ctx.clearRect(0, 0, s, s);

            this.drawShadow();
            this.drawFrame();
            this.drawBackground();
            this.drawScale();
            this.drawLCD();
            this.drawPointers();
            this.drawCenter();
            this.drawGlass();
        }


        /* =====================================================
           OMBRA
        ===================================================== */

        drawShadow() {

            const ctx = this.ctx;
            const c = this.center;
            const r = this.size * 0.47;

            ctx.save();

            ctx.beginPath();
            ctx.arc(c, c, r, 0, Math.PI * 2);

            ctx.shadowColor =
                "rgba(0,0,0,0.35)";

            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 7;

            ctx.fillStyle = "#888";

            ctx.fill();

            ctx.restore();
        }


        /* =====================================================
           CORNICE
        ===================================================== */

        drawFrame() {

            const ctx = this.ctx;
            const c = this.center;
            const r = this.size * 0.47;

            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    this.size,
                    this.size
                );

            gradient.addColorStop(
                0,
                "#eeeeee"
            );

            gradient.addColorStop(
                0.45,
                "#777777"
            );

            gradient.addColorStop(
                0.65,
                "#bcbcbc"
            );

            gradient.addColorStop(
                1,
                "#555555"
            );

            ctx.save();

            ctx.beginPath();
            ctx.arc(c, c, r, 0, Math.PI * 2);

            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        }


        /* =====================================================
           SFONDO BEIGE
        ===================================================== */

        drawBackground() {

            const ctx = this.ctx;
            const c = this.center;
            const r = this.size * 0.415;

            const gradient =
                ctx.createRadialGradient(
                    c * 0.8,
                    c * 0.75,
                    0,
                    c,
                    c,
                    r
                );

            gradient.addColorStop(
                0,
                "#fffdf7"
            );

            gradient.addColorStop(
                0.55,
                "#f4f0e6"
            );

            gradient.addColorStop(
                1,
                "#ddd7c8"
            );

            ctx.save();

            ctx.beginPath();
            ctx.arc(c, c, r, 0, Math.PI * 2);

            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        }


        /* =====================================================
           SCALA 360°
        ===================================================== */

        drawScale() {

            const ctx = this.ctx;
            const c = this.center;

            const outer =
                this.size * 0.385;

            const major =
                this.size * 0.355;

            const minor =
                this.size * 0.365;

            ctx.save();

            ctx.translate(c, c);

            ctx.strokeStyle =
                "rgba(45,45,45,0.75)";

            ctx.fillStyle =
                "#303030";

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let deg = 0; deg < 360; deg += 5) {

                /*
                 * 0° = N
                 *
                 * canvas:
                 * 0° = destra
                 *
                 * quindi sottraiamo 90°
                 */

                const angle =
                    (deg - 90) * Math.PI / 180;

                let length;

                if (deg % 10 === 0) {
                    length = major;
                } else {
                    length = minor;
                }

                ctx.save();

                ctx.rotate(angle);

                ctx.beginPath();

                ctx.lineWidth =
                    deg % 10 === 0
                        ? 1.5
                        : 1;

                ctx.moveTo(outer, 0);
                ctx.lineTo(length, 0);

                ctx.stroke();

                ctx.restore();
            }

            /* Cardinali */

            const cardinal =
                [
                    ["N", 0],
                    ["E", 90],
                    ["S", 180],
                    ["W", 270]
                ];

            ctx.font =
                "bold " +
                Math.round(this.size * 0.065) +
                "px Inter, Arial, sans-serif";

            cardinal.forEach(([label, deg]) => {

                const angle =
                    (deg - 90) *
                    Math.PI / 180;

                const radius =
                    this.size * 0.315;

                const x =
                    Math.cos(angle) * radius;

                const y =
                    Math.sin(angle) * radius;

                ctx.fillText(
                    label,
                    x,
                    y
                );
            });


            /* Intercardinali */

            const intermediate =
                [
                    ["NE", 45],
                    ["SE", 135],
                    ["SW", 225],
                    ["NW", 315]
                ];

            ctx.font =
                Math.round(this.size * 0.045) +
                "px Inter, Arial, sans-serif";

            intermediate.forEach(([label, deg]) => {

                const angle =
                    (deg - 90) *
                    Math.PI / 180;

                const radius =
                    this.size * 0.305;

                const x =
                    Math.cos(angle) * radius;

                const y =
                    Math.sin(angle) * radius;

                ctx.fillText(
                    label,
                    x,
                    y
                );
            });

            ctx.restore();
        }


        /* =====================================================
           LCD
        ===================================================== */

        drawLCD() {

            const ctx = this.ctx;
            const c = this.center;

            const width =
                this.size * 0.30;

            const height =
                this.size * 0.105;

            const x =
                c - width / 2;

            const y1 =
                this.size * 0.265;

            const y2 =
                this.size * 0.625;


            this.drawLCDBox(
                x,
                y1,
                width,
                height
            );

            this.drawLCDBox(
                x,
                y2,
                width,
                height
            );


            /* Titoli */

            ctx.save();

            ctx.textAlign = "center";

            ctx.font =
                Math.round(this.size * 0.038) +
                "px Inter, Arial, sans-serif";

            ctx.fillStyle =
                this.pointerColorLatest;

            ctx.fillText(
                this.lcdTitleStrings[0],
                c,
                y1 - this.size * 0.018
            );

            ctx.fillStyle =
                this.pointerColorAverage;

            ctx.fillText(
                this.lcdTitleStrings[1],
                c,
                y2 + height +
                this.size * 0.025
            );

            ctx.restore();


            /* Valori */

            this.drawLCDValue(
                this.latest,
                c,
                y1,
                width,
                height
            );

            this.drawLCDValue(
                this.average,
                c,
                y2,
                width,
                height
            );
        }


        drawLCDBox(x, y, width, height) {

            const ctx = this.ctx;

            ctx.save();

            const gradient =
                ctx.createLinearGradient(
                    x,
                    y,
                    x,
                    y + height
                );

            gradient.addColorStop(
                0,
                "#eeeeee"
            );

            gradient.addColorStop(
                0.5,
                "#ffffff"
            );

            gradient.addColorStop(
                1,
                "#d5d5d5"
            );

            ctx.beginPath();

            ctx.roundRect(
                x,
                y,
                width,
                height,
                5
            );

            ctx.fillStyle =
                gradient;

            ctx.fill();

            ctx.strokeStyle =
                "rgba(0,0,0,0.35)";

            ctx.lineWidth = 1;

            ctx.stroke();

            ctx.restore();
        }


        drawLCDValue(value, center, y, width, height) {

            const ctx = this.ctx;

            let text =
                Math.round(value)
                    .toString()
                    .padStart(3, "0");

            text += "°";

            ctx.save();

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.font =
                "bold " +
                Math.round(this.size * 0.062) +
                "px monospace";

            ctx.fillStyle =
                "#202020";

            ctx.shadowColor =
                "rgba(0,0,0,0.18)";

            ctx.shadowBlur = 2;

            ctx.fillText(
                text,
                center,
                y + height / 2
            );

            ctx.restore();
        }


        /* =====================================================
           PUNTATORI
        ===================================================== */

        drawPointers() {

            /*
             * Disegniamo prima la media blu
             * e poi la direzione istantanea rossa.
             */

            this.drawPointer(
                this.average,
                this.pointerColorAverage,
                true
            );

            this.drawPointer(
                this.latest,
                this.pointerColorLatest,
                false
            );
        }


        drawPointer(
            direction,
            color,
            average
        ) {

            const ctx = this.ctx;
            const c = this.center;

            /*
             * Lasciamo spazio ai due LCD.
             */

            const length =
                this.size * 0.275;

            const tail =
                this.size * 0.075;

            const angle =
                (direction - 90) *
                Math.PI / 180;

            ctx.save();

            ctx.translate(c, c);
            ctx.rotate(angle);


            /*
             * Ombra
             */

            ctx.shadowColor =
                "rgba(0,0,0,0.35)";

            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;


            /*
             * Puntatore
             */

            ctx.beginPath();

            ctx.moveTo(
                length,
                0
            );

            ctx.lineTo(
                -tail,
                -this.size * 0.027
            );

            ctx.lineTo(
                -tail,
                this.size * 0.027
            );

            ctx.closePath();

            ctx.fillStyle =
                color;

            ctx.fill();


            /*
             * Bordo
             */

            ctx.shadowColor =
                "transparent";

            ctx.strokeStyle =
                "rgba(0,0,0,0.5)";

            ctx.lineWidth = 1;

            ctx.stroke();

            ctx.restore();
        }


        /* =====================================================
           CENTRO
        ===================================================== */

        drawCenter() {

            const ctx = this.ctx;
            const c = this.center;

            const radius =
                this.size * 0.055;

            ctx.save();

            const gradient =
                ctx.createRadialGradient(
                    c - radius * 0.35,
                    c - radius * 0.35,
                    0,
                    c,
                    c,
                    radius
                );

            gradient.addColorStop(
                0,
                "#ffffff"
            );

            gradient.addColorStop(
                0.45,
                "#bcbcbc"
            );

            gradient.addColorStop(
                1,
                "#555555"
            );

            ctx.beginPath();

            ctx.arc(
                c,
                c,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                gradient;

            ctx.fill();

            ctx.strokeStyle =
                "#444";

            ctx.stroke();

            ctx.restore();
        }


        /* =====================================================
           VETRO
        ===================================================== */

        drawGlass() {

            const ctx = this.ctx;
            const c = this.center;

            const r =
                this.size * 0.405;

            ctx.save();

            const gradient =
                ctx.createRadialGradient(
                    c * 0.75,
                    c * 0.65,
                    0,
                    c,
                    c,
                    r
                );

            gradient.addColorStop(
                0,
                "rgba(255,255,255,0.18)"
            );

            gradient.addColorStop(
                0.55,
                "rgba(255,255,255,0.04)"
            );

            gradient.addColorStop(
                1,
                "rgba(255,255,255,0)"
            );

            ctx.beginPath();

            ctx.arc(
                c,
                c,
                r,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                gradient;

            ctx.fill();

            ctx.restore();
        }
    }


    /*
     * =========================================================
     * COMPATIBILITÀ CON IL CODICE STEELSERIES
     * =========================================================
     *
     * Il tuo codice può continuare a usare:
     *
     * new windDirection(...)
     *
     */

    global.windDirection = WindDirection;

})(window);