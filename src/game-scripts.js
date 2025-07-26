var Network = pc.createScript("network");
Network.attributes.add("rakip_healthbar", {
    type: "entity"
}), Network.attributes.add("metin_healthbar", {
    type: "entity"
}), Network.attributes.add("boss_healthbar", {
    type: "entity"
}), Network.attributes.add("choise_1", {
    type: "entity"
}), Network.attributes.add("choise_2", {
    type: "entity"
}), Network.attributes.add("cit_1_group", {
    type: "entity"
}), Network.attributes.add("cit_2_group", {
    type: "entity"
}), Network.attributes.add("cit_3_group", {
    type: "entity"
}), Network.attributes.add("cit_4_group", {
    type: "entity"
}), Network.attributes.add("misyon_1", {
    type: "entity"
}), window.k_cevirme = !1, Network.id = null, Network.socket = null, window.globalTargetGuids = null, Network.prototype.initialize = function() {
    this.metinBonusManager = this.app.root.findByName("MetinBonusManager"), this.metinBonusManager || console.error("MetinBonusManager Entity bulunamadı!"), this.isGameStart = !1, this.app.on("TextEntity:UpdateContent", this.updateTextContent, this), this.app.on("network:handleAttack", this.handleAttack, this), this.app.on("network:handleMetinAttack", this.handleMetinAttack, this), this.app.on("network:handleBossAttack", this.handleBossAttack, this), this.app.on("network:skillAttack", this.skillAttack, this), this.app.on("Player:TakeDamage", this.displayDamageText, this), this.app.on("ShowTextElement", this.onShowTextElement, this), this.metins = {}, this.bosses = {}, this.others = {}, this.otherDamages = {}, this.player = this.app.root.findByName(window.secilenGlobalPlayer), this.f3BasincaEntity = this.app.root.findByName(window.f3basinca), this.f3SurekliEntity = this.app.root.findByName(window.f3surekli), this.f2BasincaEntity = this.app.root.findByName(window.f2), this.f1BasincaEntity = this.app.root.findByName(window.f1), this.dortBasincaEntity = this.app.root.findByName(window.dort), this.ucBasincaEntity = this.app.root.findByName(window.uc), this.kilicEntity = this.app.root.findByName(window.item), this.other = null, this.characterEntity = this.app.root.findByName(window.secilenGlobalCharacter), this.stone = this.app.root.findByName("Stone2"), this.boss = this.app.root.findByName("Boss_1_Seyt");
    var t = io.connect("https://46.20.15.223:3000");
    Network.socket = t;
    var e = this;
    t.emit("otherelize", {
        globalCharacter: window.globalCharacter,
        globalPlayer: window.globalPlayer,
        globalOther: window.globalOther
    });
    var i = setInterval((function() {
        null !== window.globalPlayerId && (t.emit("initialize", {
            metinId: 1,
            bossId: 1,
            otherId: window.globalPlayerId,
            name: window.secilenGlobalOther,
            char_name: window.secilenGlobalCharacter,
            globalf3Basinca: window.secilenf3Basinca,
            globalf3Surekli: window.secilenF3Surekli,
            globalf2: window.secilenf2,
            globalf1: window.secilenf1,
            globaldort: window.secilendort,
            globaluc: window.secilenuc,
            globalitem: window.secilenitem
        }), clearInterval(i))
    }), 100);
    t.on("updateMetinHP", (t => {
        const e = this.metins[t.id]?.entity;
        e && e.fire("update:hp", t.currentHP)
    })), t.on("setPosition", (t => {
        console.log("Sunucudan gelen pozisyon bilgisi:", t), this.player && this.player.rigidbody ? window.globalName == t.id && (this.cit_1_group.enabled = !0, this.cit_2_group.enabled = !0, this.cit_3_group.enabled = !0, this.cit_4_group.enabled = !0, this.player.rigidbody.teleport(t.x, t.y, t.z), this.isGameStart = !0) : console.error("Player objesi veya rigidbody tanımlı değil!")
    })), t.on("playerLevelUpdated", (t => {
        window.globallevel = t.globallevel, window.globalname = t.globalname, this.updateNameAndLevel = t.updateNameAndLevel
    }));
    const a = {
        player_id: window.globalPlayerId
    };
    fetch("https://www.m2w2.com.tr/getCharacterLevel.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(a)
    }).then((t => t.json())).then((t => {
        t.error ? console.error("Veri yüklenirken hata:", t.error) : (window.globalLevelKac = t.level, this.app.fire("UpdateGlobalLevel", window.globalLevelKac), this.app.fire("SetGlobalName", window.globalName))
    })).catch((t => {
        console.error("API çağrısı sırasında hata oluştu:", t)
    }));
    const n = {
        player_id: window.globalPlayerId,
        player_name: window.secilenGlobalPlayer,
        character_name: window.secilenGlobalCharacter,
        other_name: window.secilenGlobalOther,
        globalname: window.secilenName
    };
    fetch("https://www.m2w2.com.tr/setCharacterData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(n)
    }).then((t => t.json())).then((t => {
        t.error ? console.log("Veri kaydedilemedi:", t.error) : console.log("Karakter bilgileri başarıyla kaydedildi:", t)
    })).catch((t => {
        console.error("Veri kaydederken hata:", t)
    })), t.on("newMetinEntities", (function(t) {
        console.log("Yeni metin taşları geldi:", t), t.forEach((function(t) {
            e.addMetin(t)
        }))
    })), t.on("newBossEntities", (function(t) {
        console.log("Yeni bosslar geldi:", t), t.forEach((function(t) {
            e.addBoss(t)
        }))
    })), t.on("newOtherEntity", (function(t) {
        console.log("Other karakter geldi:", t), e.addOther(t)
    })), t.on("updateDatabase", (t => {
        fetch("https://www.m2w2.com.tr/loadCharacterData.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                player_id: t.player_id,
                player_hp: t.player_hp,
                player_svs_gucu: t.player_svs_gucu
            })
        }).then((t => t.json())).then((t => {
            console.log("Oyuncu verileri başarıyla güncellendi.")
        })).catch((t => {
            console.error("Veri güncellenirken hata:", t)
        }))
    })), t.on("updateHealth", (function(t) {
        fetch("https://www.m2w2.com.tr/loadCharacterDataHP.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                player_id: t.id,
                player_hp: t.hp,
                player_svs_gucu: t.svs_gucu
            })
        }).then((t => t.json())).then((t => {
            console.log("Oyuncu verileri başarıyla güncellendi.")
        })).catch((t => {
            console.error("Veri güncellenirken hata:", t)
        }))
    })), t.on("updateMetin", (t => {
        t.attackerId === window.globalPlayerId && (window.globalMetinId = t.targetId, window.damageAttackerToMetin = t.attackerSVSGucu, this.app.fire("Player:MetinDamage", {
            damageAmount: window.damageAttackerToMetin,
            guid: window.globalMetinTargetGuids
        }))
    })), t.on("updateBoss", (t => {
        t.attackerId === window.globalPlayerId && (window.globalBossId = t.targetId, window.damageAttackerToBoss = t.attackerSVSGucu, this.app.fire("Player:OtherDamage", {
            damageAmount: window.damageAttackerToBoss,
            guid: window.globalBossTargetGuids
        }))
    })), t.on("bossAttackToPlayer", (function(t) {
        e.setBossAttackToPlayer(t.atck_id, t.boss_id)
    })), t.on("updateTarget", (t => {
        t.attackerId === window.globalPlayerId && (window.globalTargetId = t.targetId, window.damageAttacker = t.attackerSVSGucu, this.app.fire("Player:OtherDamage", {
            damageAmount: window.damageAttacker,
            guid: window.globalHandleTargetGuids
        }))
    })), t.on("skillUsed", (t => {
        t.attackerId === window.globalPlayerId && (window.globalTargetId = t.targetId, window.globalAttackerId = t.attackerId, window.skillDamageAttacker = t.attackerSVSGucu, setTimeout((() => {
            this.app.fire("Player:OtherDamage", {
                damageAmount: window.skillDamageAttacker,
                guid: window.globalSkillTargetGuids
            })
        }), 250))
    })), t.on("deadPlayer", (function(t) {
        e.setDeadState(t.id, !0, t.x, t.y, t.z, t.isForBossDead)
    })), t.on("deadMetin", (function(t) {
        e.setMetinDeadState(t.id, !0, t.atck_id)
    })), t.on("criticalHit", (function(t) {
        e.playCriticalHit(!0, t.atck_id)
    })), t.on("sunucudanTaskAl", (function(t) {
        e.sunucudanTaskAl(t.globalname, t.gorevguc, t.gorevstr)
    })), t.on("highDamage", (function(t) {
        e.highDamage(t.attackerId, t.globalname, t.misyon_1, t.misyon_2, t.misyon_3, t.misyon_4)
    })), t.on("setPositionForBossKillPlayer", (function(t) {
        e.setPositionForBossKillPlayer(!0, t.id, t.x, t.y, t.z)
    })), t.on("deadBoss", (function(t) {
        e.setBossDeadState(t.id, !0, t.atck_id)
    })), t.on("alDamage", (function(t) {
        e.setAlDamage(t.id, t.comboAlti, t.atck_id, t.damage)
    })), t.on("dusBro", (function(t) {
        e.setDusBro(t.id, t.atck_id, t.hamleOn)
    })), t.on("alOther", (function(t) {
        e.setAlOther(t.name, t.char_name, t.f3Basinca, t.f3Surekli, t.f2, t.f1, t.dort, t.uc, t.item)
    })), t.on("otherData", (function(t) {
        e.initializeOthersLan(t)
    })), t.on("otherCharacterData", (function(t) {
        e.initializeOthers(t)
    })), t.on("otherPlayerMoved", (function(t) {
        e.otherMovePlayer(t)
    })), t.on("killPlayer", (function(t) {
        e.removePlayer(t)
    })), t.on("playerSVSGucu", (function(t) {
        window.globalPlayerSVSGucu = t
    }))
}, Network.prototype.initializeOthers = function(t) {
    window.bizimGlobalCharacter = t.globalCharacter, window.bizimGlobalPlayer = t.globalPlayer, window.bizimGlobalOther = t.globalOther, console.log(window.bizimGlobalOther)
}, Network.prototype.initializeOthersLan = function(t) {
    for (var e in this.others = t.others, Network.id = t.id, window.globalPlayerId = Network.id, this.others) e !== Network.id && (this.others[e].entity = this.createOtherEntity(this.others[e]));
    this.initialized = !0, console.log("initialized")
}, Network.prototype.handleAttack = function() {
    var t = this.player.getPosition();
    let e = [];
    for (var i in this.others)
        if (i !== Network.id) {
            var a = this.others[i].entity,
                n = a._guid;
            if (a) t.distance(a.getPosition()) < 2 && (Network.socket.emit("playerAttack", {
                targetId: i,
                yari_insan: window.yari_insan_value,
                ort_zarar: window.ort_zarar_value,
                guc_value: window.guc_value,
                sav_guc: window.sav_guc_value,
                kritik_value: window.kritik_value,
                str_value: window.str_value
            }), e.push(a._guid), this.rakip_healthbar.enabled = !0, this.metin_healthbar.enabled = !1, this.boss_healthbar.enabled = !1, this.app.fire("select:target", n), this.characterEntity.sound && this.characterEntity.sound.slot("Hit") && this.characterEntity.sound.slot("Hit").play())
        } window.globalHandleTargetGuids = e
}, Network.prototype.handleMetinAttack = function() {
    var t = this.player.getPosition();
    let e = [];
    for (var i in this.metins)
        if (this.metins.hasOwnProperty(i) && i !== Network.id) {
            var a = this.metins[i].entity,
                n = a._guid;
            if (a) t.distance(a.getPosition()) < 1.5 && (Network.socket.emit("metinAttack", {
                targetId: i,
                ort_zarar: window.ort_zarar_value,
                guc_value: window.guc_value,
                metin_guc: window.metin_guc_value,
                kritik_value: window.kritik_value,
                str_value: window.str_value
            }), e.push(a._guid), this.metin_healthbar.enabled = !0, this.rakip_healthbar.enabled = !1, this.boss_healthbar.enabled = !1, this.app.fire("select:target", n), this.characterEntity.sound && this.characterEntity.sound.slot("Hit") && this.characterEntity.sound.slot("Hit").play())
        } window.globalMetinTargetGuids = e
}, Network.prototype.handleBossAttack = function() {
    var t = this.player.getPosition();
    let e = [];
    for (var i in this.bosses)
        if (this.bosses.hasOwnProperty(i) && i !== Network.id) {
            var a = this.bosses[i].entity,
                n = a._guid;
            if (a) t.distance(a.getPosition()) < 3 && (Network.socket.emit("bossAttack", {
                targetId: i,
                ort_zarar: window.ort_zarar_value,
                patron_guc: window.patron_guc_value,
                seytan_guc: window.seytan_guc_value,
                olumsuz_guc: window.olumsuz_guc_value,
                guc_value: window.guc_value,
                kritik_value: window.kritik_value,
                str_value: window.str_value
            }), e.push(a._guid), this.boss_healthbar.enabled = !0, this.rakip_healthbar.enabled = !1, this.metin_healthbar.enabled = !1, this.app.fire("select:target", n), this.characterEntity.sound && this.characterEntity.sound.slot("Hit") && this.characterEntity.sound.slot("Hit").play())
        } window.globalBossTargetGuids = e
}, Network.prototype.skillAttack = function() {
    var t = this.player.getPosition();
    let e = [];
    for (var i in this.others)
        if (i !== Network.id) {
            var a = this.others[i].entity,
                n = a._guid;
            if (a) t.distance(a.getPosition()) < 2 && (Network.socket.emit("playerSkillAttack", {
                targetId: i,
                yari_insan: window.yari_insan_value,
                bec_hasari: window.bec_hasari_value,
                guc_value: window.guc_value,
                sav_guc: window.sav_guc_value,
                kritik_value: window.kritik_value,
                str_value: window.str_value
            }), e.push(a._guid), this.rakip_healthbar.enabled = !0, this.metin_healthbar.enabled = !1, this.boss_healthbar.enabled = !1, this.app.fire("select:target", n), this.characterEntity.sound && this.characterEntity.sound.slot("Hit") && this.characterEntity.sound.slot("Hit").play())
        } window.globalSkillTargetGuids = e
}, Network.prototype.setDusBro = function(t, e, i) {
    this.others[e] && this.others[e].entity && window.globalPlayerId !== e && i && window.globalPlayerId == t && (this.characterEntity.anim.setBoolean("isDusme", !0), setTimeout((() => {
        this.characterEntity.anim.setBoolean("isDusme", !1), this.characterEntity.anim.setBoolean("isKalkma", !0), setTimeout((() => {
            this.characterEntity.anim.setBoolean("isKalkma", !1)
        }), 1750)
    }), 1500))
}, Network.prototype.setAlOther = function(t, e, i, a, n, o, r, s, l) {
    this.yeniOtherName = t, this.yeniOtherCharName = e, this.yeniOtherf3Basinca = i, this.yeniOtherf3Surekli = a, this.yeniOtherf2 = n, this.yeniOtherf1 = o, this.yeniOtherdort = r, this.yeniOtheruc = s, this.yeniOtheritem = l
}, Network.prototype.setAlDamage = function(t, e, i, a) {
    if (this.others[t] && this.others[t].entity) {
        var n = this.others[t].entity;
        n.characterEntity && n.characterEntity.anim && (n.characterEntity.anim.getBoolean("isAttacking") || e || n.characterEntity.anim.getBoolean("isDusme") || n.characterEntity.anim.getBoolean("isKalkma") || n.characterEntity.anim.getBoolean("isDead") || (n.characterEntity.anim.setBoolean("alDamage", !0), setTimeout((() => {
            n.characterEntity.anim.setBoolean("alDamage", !1)
        }), 500)))
    }
    this.others[i] && this.others[i].entity && window.globalPlayerId !== i && e && window.globalPlayerId == t && (this.characterEntity.anim.setBoolean("isDusme", !0), setTimeout((() => {
        this.characterEntity.anim.setBoolean("isDusme", !1), this.characterEntity.anim.setBoolean("isKalkma", !0), setTimeout((() => {
            this.characterEntity.anim.setBoolean("isKalkma", !1)
        }), 1750)
    }), 1500))
}, Network.prototype.setDeadState = function(t, e, i, a, n, o) {
    if (this.others[t] && this.others[t].entity) {
        var r = this.others[t].entity;
        r.characterEntity && r.characterEntity.anim && (this.characterEntity.sound && this.characterEntity.sound.slot("Dead") && this.characterEntity.sound.slot("Dead").play(), e && setTimeout((() => {
            if (r.characterEntity && r.characterEntity.anim) {
                const e = 2e4;
                fetch("https://www.m2w2.com.tr/loadHP.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        player_id: t,
                        player_hp: e
                    })
                }).then((t => t.json())).then((t => {})).catch((e => {
                    console.error(`Oyuncu ${t} sağlığı güncellenirken hata oluştu:`, e)
                }))
            }
        }), 5e3))
    }
}, Network.prototype.setMetinDeadState = function(t, e, i) {
    if (this.metins[t] && this.metins[t].entity) {
        var a = this.metins[t].entity;
        if (window.globalMetinDurum = a, a.characterEntity && a.characterEntity.anim && e) {
            if (this.app.fire("deadMetin", {
                    id: t,
                    atck_id: i
                }), a.characterEntity.anim.setBoolean("Live", !1), a.characterEntity.anim.setBoolean("Dead", !0), this.metin_healthbar.enabled = !1, a.collision && (a.collision.enabled = !1), a.rigidbody && (a.rigidbody.enabled = !1), window.globalPlayerId == i && (window.str_value += 5, this.metinBonusManager && this.metinBonusManager.script.metinStoneBonusChooser && this.metinBonusManager.script.metinStoneBonusChooser.showBonusChooser()), window.globalPlayerId == i) {
                var n = parseInt(window.globalLevelKac, 10);
                n += 1, this.app.fire("UpdateGlobalLevel", n);
                const t = {
                    player_id: window.globalPlayerId,
                    player_new_level: n
                };
                fetch("https://www.m2w2.com.tr/setCharacterLevel.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(t)
                }).then((t => t.json())).then((t => {
                    t.error ? console.log("Veri kaydedilemedi:", t.error) : console.log("Karakter bilgileri başarıyla kaydedildi:", t)
                })).catch((t => {
                    console.error("Veri kaydederken hata:", t)
                }))
            }
            setTimeout((() => {
                a && (a.enabled = !1, console.log("[Metin] Entity artık görünmez oldu (5sn sonra)."))
            }), 5e3), setTimeout((() => {
                a && (a.enabled = !0, a.characterEntity && a.characterEntity.anim && (a.characterEntity.anim.setBoolean("Live", !0), a.characterEntity.anim.setBoolean("Dead", !1)), console.log("[Metin] Entity yeniden doğdu (20sn sonra) ve tekrar görünüyor."), a.collision && (a.collision.enabled = !0), a.rigidbody && (a.rigidbody.enabled = !0))
            }), 2e4)
        }
    }
}, Network.prototype.playCriticalHit = function(t, e) {
    window.globalPlayerId == e && t && this.characterEntity.sound && this.characterEntity.sound.slot("critical") && this.characterEntity.sound.slot("critical").play()
}, Network.prototype.sunucudanTaskAl = function(t, e, i) {
    this.misyon_1.enabled = !0, this.app.fire("updateText", t, e, i), setTimeout((() => {
        this.misyon_1.enabled = !1
    }), 5e3)
}, Network.prototype.tamamlanmisGorevler = {
    gorev_1: !1,
    gorev_2: !1,
    gorev_3: !1,
    gorev_4: !1
}, Network.prototype.highDamage = function(t, e, i, a, n, o) {
    [{
        gorev: i,
        guc: 2e3,
        strValue: 300,
        isim: "gorev_1"
    }, {
        gorev: a,
        guc: 6e3,
        strValue: 1e3,
        isim: "gorev_2"
    }, {
        gorev: n,
        guc: 1e4,
        strValue: 3e3,
        isim: "gorev_3"
    }, {
        gorev: o,
        guc: 15e3,
        strValue: 5e3,
        isim: "gorev_4"
    }].forEach((i => {
        this.tamamlanmisGorevler[i.isim] || i.gorev || (this.tamamlanmisGorevler[i.isim] = !0, Network.socket.emit("sunucuyaTaskGonder", {
            global_name: e,
            gorev_guc: i.guc,
            gorev_str: i.strValue
        }), this.misyon_1.enabled = !0, this.app.fire("updateText", e, i.guc, i.strValue), setTimeout((() => {
            this.misyon_1.enabled = !1
        }), 5e3), window.globalPlayerId === t && (window.str_value += i.strValue))
    }))
}, Network.prototype.setPositionForBossKillPlayer = function(t, e, i, a, n) {
    t && (console.log(i, a, n), console.log("pozisyon değişme çalıştı OLMMMMMMMMMMMMMMM"), this.player && this.player.rigidbody ? globalPlayerId == e && this.player.rigidbody.teleport(i, a, n) : console.error("Player objesi veya rigidbody tanımlı değil!"))
}, Network.prototype.activeBossAttacks = {}, Network.prototype.setBossAttackToPlayer = function(t, e) {
    if (window.globalPlayerId === t) {
        if (this.characterEntity.anim.getBoolean("isDead")) return;
        if (this.activeBossAttacks[e]) return;
        this.activeBossAttacks[e] = !0;
        const i = this.player.getPosition();
        if (this.bosses[e] && this.bosses[e].entity) {
            const a = this.bosses[e].entity;
            let n = !1,
                o = 0;
            const r = setInterval((() => {
                if (n) return clearInterval(r), void delete this.activeBossAttacks[e];
                const s = i.distance(a.getPosition());
                if (s < 3 && !this.characterEntity.anim.getBoolean("isDead")) {
                    s > 2 && s < 3 && a.lookAt(i);
                    const e = Date.now();
                    e - o >= 1500 && (o = e, a.characterEntity && a.characterEntity.anim && (a.characterEntity.anim.setBoolean("Attack", !0), Network.socket.emit("bossAttackPlayer", {
                        targetId: t,
                        simsek_sav: window.simsek_sav_value,
                        ruzgar_sav: window.ruzgar_sav_value
                    }), setTimeout((() => {
                        a.characterEntity.anim.setBoolean("Attack", !1)
                    }), 2e3)))
                } else a.characterEntity && a.characterEntity.anim && a.characterEntity.anim.setBoolean("Attack", !1)
            }), 500);
            a.on("destroy", (() => {
                n = !0, clearInterval(r), delete this.activeBossAttacks[e]
            }));
            const s = setInterval((() => {
                i.distance(a.getPosition()) >= 3 && (clearInterval(r), clearInterval(s), delete this.activeBossAttacks[e], a.characterEntity && a.characterEntity.anim && a.characterEntity.anim.setBoolean("Attack", !1))
            }), 500)
        }
    }
}, Network.prototype.setBossDeadState = function(t, e, i) {
    if (this.bosses[t] && this.bosses[t].entity) {
        var a = this.bosses[t].entity;
        if (window.globalMetinDurum = a, a.characterEntity && a.characterEntity.anim && e) {
            if (a.characterEntity.anim.setBoolean("Attack", !1), a.characterEntity.anim.setBoolean("Live", !1), a.characterEntity.anim.setBoolean("Dead", !0), this.metin_healthbar.enabled = !1, window.globalPlayerId == i && (this.choise_1.enabled = !0, this.choise_2.enabled = !0), window.globalPlayerId == i) {
                var n = parseInt(window.globalLevelKac, 10);
                n += 1, this.app.fire("UpdateGlobalLevel", n);
                const t = {
                    player_id: window.globalPlayerId,
                    player_new_level: n
                };
                fetch("https://www.m2w2.com.tr/setCharacterLevel.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(t)
                }).then((t => t.json())).then((t => {
                    t.error ? console.log("Veri kaydedilemedi:", t.error) : console.log("Karakter bilgileri başarıyla kaydedildi:", t)
                })).catch((t => {
                    console.error("Veri kaydederken hata:", t)
                }))
            }
            setTimeout((() => {
                a.characterEntity && a.characterEntity.anim && (a.characterEntity.anim.setBoolean("Live", !0), a.characterEntity.anim.setBoolean("Dead", !1))
            }), 5e3)
        }
    }
}, Network.prototype.addMetin = function(t) {
    this.metins[t.id] = t, this.metins[t.id].entity = this.createMetinEntity(t)
}, Network.prototype.addBoss = function(t) {
    this.bosses[t.id] = t, this.bosses[t.id].entity = this.createBossEntity(t)
}, Network.prototype.addOther = function(t) {
    this.others[t.id] = t, this.others[t.id].entity = this.createOtherEntity(t)
}, Network.prototype.otherMovePlayer = function(t) {
    if (this.initialized && this.others[t.id]) {
        var e = this.others[t.id].entity;
        e.rigidbody.teleport(t.x, t.y, t.z), e.targetPosition = new pc.Vec3(t.x, t.y, t.z), e.targetRotation = new pc.Quat(t.rotX, t.rotY, t.rotZ, t.rotW);
        var i = e.findByName("player_name");
        if (i && i.element) {
            if (this.updateNameAndLevel) {
                var a = window.globallevel || window.oyuncuLevel || "0",
                    n = window.globalname || "Bilinmeyen Orospu";
                i.element.text = `Lv${a} ${n}`, this.updateNameAndLevel = !1
            }
        } else console.warn("player_name text elementi bulunamadı: ", t.id);
        e.characterEntity && e.characterEntity.anim ? (e.characterEntity.anim.setFloat("Distance", t.distance || 0), e.characterEntity.anim.setBoolean("isSpace", t.isSpace || !1), e.characterEntity.anim.setBoolean("isAttacking", t.isAttacking || !1), e.characterEntity.anim.setInteger("Combo", t.combo || 0), e.characterEntity.anim.setBoolean("k_cevirme", t.k_cevirme || !1), e.characterEntity.anim.setBoolean("h_kilici", t.h_kilici || !1), e.characterEntity.anim.setBoolean("isDead", t.isDead || !1), e.characterEntity.anim.setBoolean("isStunning", t.isStunning || !1), e.characterEntity.anim.setBoolean("isYumruk", t.isYumruk || !1), e.characterEntity.anim.setBoolean("hamle", t.hamle || !1), e.characterEntity.anim.setBoolean("ofke", t.ofke || !1), e.characterEntity.anim.setBoolean("uc_yonlu", t.uc_yonlu || !1), e.characterEntity.anim.setBoolean("isDusme", t.isDusme || !1), e.characterEntity.anim.setBoolean("isKalkma", t.isKalkma || !1)) : console.warn("Diğer oyuncunun anim özelliği eksik: ", t.id), this.updateEntityState(e, t)
    }
}, Network.prototype.updateEntityState = function(t, e) {
    t.f3BasincaEntity && (t.f3BasincaEntity.enabled = e.f3BasincaEnabled || !1), t.f3SurekliEntity && (t.f3SurekliEntity.enabled = e.f3SurekliEnabled || !1), t.kilicEntity && (t.kilicEntity.enabled = e.kilicEnabled || !1), t.f1BasincaEntity && (t.f1BasincaEntity.enabled = e.f1BasincaEnabled || !1), t.f2BasincaEntity && (t.f2BasincaEntity.enabled = e.f2BasincaEnabled || !1), t.dortBasincaEntity && (t.dortBasincaEntity.enabled = e.dortBasincaEnabled || !1), t.ucBasincaEntity && (t.ucBasincaEntity.enabled = e.ucBasincaEnabled || !1)
}, Network.prototype.removePlayer = function(t) {
    const e = t || window.globalPlayerId;
    this.others[e] ? (this.others[e].entity && this.others[e].entity.destroy(), delete this.others[e]) : console.warn(`Oyuncu ${e} bulunamadı.`), t && t !== e && this.others[t] && (this.otherDamages[t] && delete this.otherDamages[t], this.others[t].entity && this.others[t].entity.destroy(), delete this.others[t])
}, Network.prototype.createOtherEntity = function(t) {
    t.player_name;
    this.yeni_other_name = t.other_name, this.oyuncuName = t.globalname, window.oyuncuLevel = t.globallevel, this.yeni_character_name = t.character_name, this.yeniOtherf3Basinca = t.g_f3Basinca, this.yeniOtherf3Surekli = t.g_f3Surekli, this.yeniOtheritem = t.g_item, this.yeniOtherf2 = t.g_f2, this.yeniOtherf1 = t.g_f1, this.yeniOtherdort = t.g_dort, this.yeniOtheruc = t.g_uc, this.isimOther = this.app.root.findByName(this.yeni_other_name), console.log(this.yeni_other_name), console.log(this.yeni_character_name);
    var e = this.isimOther.clone();
    e.enabled = !0, this.isimOther.getParent().addChild(e), e.tags.add("enemy"), t && e.rigidbody.teleport(t.x, t.y, t.z), e.characterEntity = e.findByName(this.yeni_character_name), e.f3BasincaEntity = e.findByName(this.yeniOtherf3Basinca), e.f3BasincaEntity || console.error("'f3Basinca' entity bulunamadı!"), e.f3SurekliEntity = e.findByName(this.yeniOtherf3Surekli), e.f3SurekliEntity || console.error("'f3Surekli' entity bulunamadı!"), e.kilicEntity = e.findByName(this.yeniOtheritem), e.kilicEntity || console.error("'kilic' entity bulunamadı!"), e.f2BasincaEntity = e.findByName(this.yeniOtherf2), e.f2BasincaEntity || console.error("'kilic' entity bulunamadı!"), e.f1BasincaEntity = e.findByName(this.yeniOtherf1), e.f1BasincaEntity || console.error("'kilic' entity bulunamadı!"), e.dortBasincaEntity = e.findByName(this.yeniOtherdort), e.dortBasincaEntity || console.error("'kilic' entity bulunamadı!"), e.ucBasincaEntity = e.findByName(this.yeniOtheruc), e.ucBasincaEntity || console.error("'kilic' entity bulunamadı!");
    e._guid;
    var i = e.findByName("player_name");
    i ? i.element.text = "Lv" + (window.oyuncuLevel || "0") + " " + (this.oyuncuName || "Bilinmeyen Oyuncu") : ((i = new pc.Entity("player_name")).addComponent("element", {
        type: "text",
        text: "Lv" + (window.oyuncuLevel || "0") + " " + (this.oyuncuName || "Bilinmeyen Oyuncu"),
        fontAsset: this.app.assets.find("Arial", "Courier Prime Bold.ttf"),
        anchor: [.5, 0, .5, 0],
        pivot: [.5, .5],
        alignment: [pc.ALIGN_CENTER, pc.ALIGN_MIDDLE],
        autoWidth: !0,
        autoHeight: !0,
        width: 10,
        height: 1,
        color: new pc.Color(217 / 255, 194 / 255, 33 / 255, 1)
    }), i.setLocalPosition(0, 2, 0), e.addChild(i));
    e._guid;
    return e
}, Network.prototype.createMetinEntity = function(t) {
    var e = this.stone.clone();
    e.enabled = !0, this.stone.getParent().addChild(e), e.tags.add("metin"), e.rigidbody.teleport(t.x, t.y, t.z), e.characterEntity = e.findByName("ChamferCyl04"), e.characterEntity && e.characterEntity.anim && (e.characterEntity.anim.setBoolean("Live", !0), e.characterEntity.anim.setBoolean("Dead", !1)), e.metinId = t.id, e.id = t.id, e.script || (e.script = {}), e.script.metin = e.script.metin || {}, e.script.metin.id = t.id;
    var i = e._guid;
    return Network.socket.emit("newMetinEntity", {
        metinId: t.id,
        entityGuid: i
    }), e
}, Network.prototype.update = function(t) {
    for (var e in this.updatePosition(), this.others) {
        var i = this.others[e];
        i && i.entity && i.entity.targetPosition && i.entity.targetRotation && i.entity.rigidbody.teleport(i.entity.targetPosition, i.entity.targetRotation)
    }
}, Network.prototype.createBossEntity = function(t) {
    var e = this.boss.clone();
    e.enabled = !0, this.boss.getParent().addChild(e), e.tags.add("boss"), e.rigidbody.teleport(t.x, t.y, t.z), e.characterEntity = e.findByName("boss_1_seytan"), e.characterEntity && e.characterEntity.anim ? (e.characterEntity.anim.setBoolean("Live", !0), e.characterEntity.anim.setBoolean("Dead", !1)) : console.warn("'boss_1_seytan' veya anim component bulunamadı!");
    var i = e._guid;
    return Network.socket.emit("newBossEntity", {
        bossId: t.id,
        entityGuid: i
    }), e
}, Network.prototype.updatePosition = function() {
    if (this.initialized) {
        var t = this.player.getPosition(),
            e = this.characterEntity.getRotation(),
            i = this.characterEntity.anim.getFloat("Distance"),
            a = this.characterEntity.anim.getBoolean("isSpace"),
            n = this.characterEntity.anim.getBoolean("isAttacking"),
            o = this.characterEntity.anim.getInteger("Combo"),
            r = this.characterEntity.anim.getBoolean("k_cevirme"),
            s = this.characterEntity.anim.getBoolean("hamle"),
            l = this.characterEntity.anim.getBoolean("ofke"),
            c = this.characterEntity.anim.getBoolean("uc_yonlu"),
            h = this.characterEntity.anim.getBoolean("isDusme"),
            d = this.characterEntity.anim.getBoolean("isKalkma"),
            y = this.characterEntity.anim.getBoolean("h_kilici"),
            u = this.characterEntity.anim.getBoolean("isDead"),
            m = this.characterEntity.anim.getBoolean("isStunning"),
            w = this.characterEntity.anim.getBoolean("isYumruk"),
            g = this.f3BasincaEntity.enabled,
            p = this.f3SurekliEntity.enabled,
            b = this.kilicEntity.enabled,
            k = this.f2BasincaEntity.enabled,
            _ = this.f1BasincaEntity.enabled,
            f = this.dortBasincaEntity.enabled,
            E = this.ucBasincaEntity.enabled;
        Network.socket.emit("otherPositionUpdate", {
            id: Network.id,
            x: t.x,
            y: t.y,
            z: t.z,
            rotX: e.x,
            rotY: e.y,
            rotZ: e.z,
            rotW: e.w,
            distance: i,
            isSpace: a,
            isAttacking: n,
            combo: o,
            k_cevirme: r,
            hamle: s,
            ofke: l,
            uc_yonlu: c,
            isDusme: h,
            isKalkma: d,
            h_kilici: y,
            isDead: u,
            isStunning: m,
            isYumruk: w,
            f3BasincaEnabled: g,
            f2BasincaEnabled: k,
            f1BasincaEnabled: _,
            dortBasincaEnabled: f,
            ucBasincaEnabled: E,
            f3SurekliEnabled: p,
            kilicEnabled: b
        })
    }
};
var Movement = pc.createScript("movement");
Movement.attributes.add("characterEntity", {
    type: "entity"
}), Movement.attributes.add("cameraEntity", {
    type: "entity"
}), Movement.attributes.add("envanterimiz", {
    type: "entity"
}), Movement.attributes.add("choise_1", {
    type: "entity"
}), Movement.attributes.add("choise_2", {
    type: "entity"
}), Movement.attributes.add("playerSpeed", {
    type: "number",
    default: 5,
    title: "Player Speed"
}), Movement.attributes.add("attackDistance", {
    type: "number",
    default: 1.5,
    title: "Attack Distance"
}), Movement.prototype.initialize = function() {
    window.lastChoiseDisabledTime = 0, this.hasStartedCombo = !1, this.isBotting = !1, this.hasTriggeredMeselaYuru = !1, this.targetEntity = null, this.isMouseDown = !1, this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this), this.targetPosition = null, this.stoppingDistance = .3, this.groundLayerMask = 2, this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.hasTriggeredNotMoving = !1, this.hasTriggeredNotMoving2 = !1, this.force = new pc.Vec3, this.socket = Network.socket, this.attack = !1, this.previousPosition = this.entity.getPosition().clone(), this.sendInterval = setInterval((() => {
        this.sendPositionAndRotation()
    }), 50)
}, Movement.prototype.onMouseDown = function(t) {
    if (0 !== t.button) return;
    if (window.lastChoiseDisabledTime && Date.now() - window.lastChoiseDisabledTime < 50) return void console.log("[Movement] Choise yeni kapandı, mouse tıklaması engellendi.");
    if (this.choise_1 && this.choise_1.enabled || this.choise_2 && this.choise_2.enabled || this.envanterimiz && this.envanterimiz.enabled) return void console.log("[Movement] Choise veya envanter açıkken mouse ile hareket engellendi.");
    if (t.element && t.element.entity) {
        let i = t.element.entity;
        for (; i;) {
            if (i === this.choise_1 || i === this.choise_2 || i === this.envanterimiz) return void console.log("[Movement] Choise/envanter elemanına tıklandı, karakter hareket etmeyecek.");
            i = i.parent
        }
    }
    this.isMouseDown = !0;
    const i = this.cameraEntity.camera.screenToWorld(t.x, t.y, this.cameraEntity.camera.nearClip),
        e = this.cameraEntity.camera.screenToWorld(t.x, t.y, this.cameraEntity.camera.farClip),
        s = this.app.systems.rigidbody.raycastFirst(i, e);
    s && s.entity && (s.entity.tags.has("metin") ? (this.isBotting = !0, this.targetEntity = s.entity, this.targetPosition = null, this.hasStartedCombo = !1) : s.entity.name.toLowerCase().includes("ground") && (this.targetPosition = s.point.clone(), this.targetEntity = null, this.app.fire("attack:stopComboLoop")))
}, Movement.prototype.onMouseUp = function(t) {
    0 === t.button && (this.isMouseDown = !1)
}, Movement.prototype.update = function(t) {
    if (this.targetEntity) {
        const e = this.targetEntity.getPosition(),
            s = this.entity.getPosition();
        if (s.distance(e) > this.attackDistance && this.isBotting) {
            this.hasTriggeredMeselaYuru || (this.characterEntity.anim.setTrigger("meselaYuru"), this.hasTriggeredMeselaYuru = !0);
            var i = this.previousPosition.distance(s) / t;
            this.characterEntity.anim.setFloat("Distance", i), this.previousPosition.copy(s);
            const a = e.clone().sub(s);
            a.y = 0, a.normalize(), this.force.copy(a).scale(this.playerSpeed), this.entity.rigidbody.linearVelocity = this.force;
            const o = s.clone().add(a);
            this.characterEntity.lookAt(o), this.characterEntity.anim.setBoolean("isSpace", !1), this.characterEntity.anim.setBoolean("isYumruk", !1), this.attack = !1
        } else this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0), this.hasStartedCombo || (this.app.fire("attack:startComboLoop"), this.hasStartedCombo = !0), this.targetEntity = null, this.attack = !0, this.hasTriggeredMeselaYuru = !1
    } else if (!window.isSkillActive || window.isSkillKCevirmeActive) {
        var e = this.entity.forward,
            s = (this.entity.right, this.app),
            a = 0,
            o = 0,
            n = 0,
            r = this.cameraEntity.forward,
            c = this.cameraEntity.right;
        if (!this.characterEntity.anim.getBoolean("isDead") && !this.characterEntity.anim.getBoolean("isDusme") && !this.characterEntity.anim.getBoolean("isKalkma")) {
            if (s.keyboard.isPressed(pc.KEY_W) && (a += r.x, o += r.z, n++, this.isBotting = !1), s.keyboard.isPressed(pc.KEY_A) && (a -= c.x, o -= c.z, n++, this.isBotting = !1), s.keyboard.isPressed(pc.KEY_S) && (a -= r.x, o -= r.z, n++, this.isBotting = !1), s.keyboard.isPressed(pc.KEY_D) && (a += c.x, o += c.z, n++, this.isBotting = !1), n > 0 && this.targetPosition && (this.targetPosition = null), 0 === a && 0 === o && window.isSkillKCevirmeActive) {
                var h = this.characterEntity.getRotation();
                e = new pc.Vec3(0, 0, -1);
                (e = h.transformVector(e)).y = 0, e.normalize(), a = e.x, o = e.z, n = 1
            }
            if (this.app.keyboard.isPressed(pc.KEY_SPACE) ? (this.isBotting && (this.isBotting = !1, this.app.fire("attack:stopComboLoop")), this.isBotting || null !== this.targetPosition || window.isSkillActive ? this.attack = !1 : this.attack = !0) : (this.attack = !1, this.hasTriggeredNotMoving = !1, this.hasTriggeredNotMoving2 = !1), this.attack && n > 0 && !window.isSkillActive ? (this.characterEntity.anim.setBoolean("isSpace", !0), this.characterEntity.anim.setBoolean("isYumruk", !0)) : n > 0 ? (this.characterEntity.anim.setBoolean("isSpace", !1), this.characterEntity.anim.setBoolean("isYumruk", !1)) : this.hasTriggeredNotMoving || 0 !== a || 0 !== o || (this.characterEntity.anim.setBoolean("isSpace", !0), this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0), this.hasTriggeredNotMoving = !0), n > 2 && !window.isSkillActive ? (this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0), this.characterEntity.anim.setBoolean("isSpace", !0), this.attack || this.hasTriggeredNotMoving2 || (this.hasTriggeredNotMoving2 = !0)) : this.attack ? (this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0), this.hasTriggeredNotMoving || (this.characterEntity.anim.setTrigger("isNotMoving"), this.hasTriggeredNotMoving = !0)) : s.keyboard.isPressed(pc.KEY_W) && s.keyboard.isPressed(pc.KEY_S) ? (this.characterEntity.anim.setBoolean("isSpace", !0), this.characterEntity.anim.setBoolean("isYumruk", !0), this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0)) : s.keyboard.isPressed(pc.KEY_W) && s.keyboard.isPressed(pc.KEY_D) || s.keyboard.isPressed(pc.KEY_W) && s.keyboard.isPressed(pc.KEY_A) || s.keyboard.isPressed(pc.KEY_S) && s.keyboard.isPressed(pc.KEY_D) || s.keyboard.isPressed(pc.KEY_S) && s.keyboard.isPressed(pc.KEY_A) ? (this.characterEntity.anim.setBoolean("isSpace", !1), this.characterEntity.anim.setBoolean("isYumruk", !1)) : s.keyboard.isPressed(pc.KEY_A) && s.keyboard.isPressed(pc.KEY_D) ? (this.characterEntity.anim.setBoolean("isSpace", !0), this.characterEntity.anim.setBoolean("isYumruk", !0), this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0)) : (s.keyboard.isPressed(pc.KEY_S) || s.keyboard.isPressed(pc.KEY_D) || s.keyboard.isPressed(pc.KEY_A) || s.keyboard.isPressed(pc.KEY_W)) && (this.characterEntity.anim.setBoolean("isSpace", !1), this.characterEntity.anim.setBoolean("isYumruk", !1)), 0 !== a || 0 !== o) {
                let i;
                i = window.isSkillKCevirmeActive || this.attack ? 3 : 5, a *= t, o *= t, this.force.set(a, 0, o).normalize().scale(i), this.entity.rigidbody.linearVelocity = this.force;
                var y = new pc.Vec3(a, 0, o);
                if (y.length() > 0) {
                    y.normalize();
                    var d = this.entity.getPosition().clone().add(y);
                    this.characterEntity.lookAt(d)
                }
                this.sendPositionAndRotation()
            }
            var l = this.entity.getPosition(),
                p = this.previousPosition.distance(l) / t;
            if (this.characterEntity.anim.setFloat("Distance", p), this.previousPosition.copy(l), this.targetPosition && !window.isSkillActive) {
                const t = this.entity.getPosition();
                if (t.distance(this.targetPosition) > this.stoppingDistance) {
                    const i = this.targetPosition.clone().sub(t);
                    i.y = 0, i.normalize(), this.force.copy(i).scale(this.playerSpeed), this.entity.rigidbody.linearVelocity = this.force;
                    const e = t.clone().add(i);
                    this.characterEntity.lookAt(e), this.characterEntity.anim.setBoolean("isSpace", !1), this.characterEntity.anim.setBoolean("isYumruk", !1)
                } else this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0), this.characterEntity.anim.setBoolean("isSpace", !0), this.targetPosition = null
            }
            if (this.isMouseDown && !window.isSkillActive) {
                const t = this.app.mouse,
                    i = this.cameraEntity.camera.screenToWorld(t._lastX, t._lastY, this.cameraEntity.camera.nearClip),
                    e = this.cameraEntity.camera.screenToWorld(t._lastX, t._lastY, this.cameraEntity.camera.farClip),
                    s = this.app.systems.rigidbody.raycastFirst(i, e);
                s && s.entity && s.entity.name.toLowerCase().includes("ground") && (this.targetPosition = s.point.clone())
            }
        }
    } else this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0)
}, Movement.prototype.sendPositionAndRotation = function() {
    if (this.socket) {
        var t = this.entity.getPosition(),
            i = this.characterEntity.getRotation(),
            e = this.characterEntity.anim.getFloat("Distance"),
            s = this.characterEntity.anim.getBoolean("isSpace"),
            a = this.characterEntity.anim.getBoolean("isAttacking"),
            o = this.characterEntity.anim.getInteger("Combo");
        this.socket.send(JSON.stringify({
            type: "positionUpdate",
            id: Network.id,
            x: t.x,
            y: t.y,
            z: t.z,
            rotX: i.x,
            rotY: i.y,
            rotZ: i.z,
            rotW: i.w,
            distance: e,
            isSpace: s,
            isAttacking: a,
            combo: o
        }))
    }
};
var Camera = pc.createScript("camera");
Camera.attributes.add("distance", {
    type: "number",
    default: 10,
    title: "Kamera Mesafesi",
    min: 3,
    max: 15
}), Camera.attributes.add("rotationSpeed", {
    type: "number",
    default: 5,
    title: "Dönüş Hızı",
    min: 1,
    max: 10
}), Camera.attributes.add("zoomSpeed", {
    type: "number",
    default: 1,
    title: "Yakınlaşma/Uzaklaşma Hızı",
    min: .1,
    max: 5
}), Camera.attributes.add("zoomSmoothing", {
    type: "number",
    default: .1,
    title: "Yakınlaştırma/Yumuşatma Hızı",
    min: .01,
    max: 1
}), Camera.prototype.initialize = function() {
    this.isChanging = !1, this.player = this.app.root.findByName("Player"), this.cameraEntity = this.entity, this.offset = new pc.Vec3(0, 5, this.distance), this.isRightMousePressed = !1, this.angleX = 0, this.angleY = 0, this.mouseStart = new pc.Vec2, this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this), this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this), this.app.mouse.on(pc.EVENT_CONTEXTMENU, this.onContextMenu, this), window.addEventListener("contextmenu", this.onContextMenuWindow, !1), this.targetDistance = this.distance, this.keyboard = this.app.keyboard
}, Camera.prototype.onMouseDown = function(t) {
    t.button === pc.MOUSEBUTTON_RIGHT && (this.isRightMousePressed = !0, this.mouseStart.set(t.x, t.y))
}, Camera.prototype.onMouseUp = function(t) {
    t.button === pc.MOUSEBUTTON_RIGHT && (this.isRightMousePressed = !1)
}, Camera.prototype.onMouseMove = function(t) {
    if (this.isRightMousePressed) {
        var e = t.x - this.mouseStart.x,
            i = t.y - this.mouseStart.y;
        this.angleX -= e * this.rotationSpeed * .1, this.angleY -= i * this.rotationSpeed * .1, this.angleY = pc.math.clamp(this.angleY, -45, 45), this.mouseStart.set(t.x, t.y)
    }
}, Camera.prototype.onMouseWheel = function(t) {
    (t.wheel || t.deltaY) > 0 ? this.targetDistance -= this.zoomSpeed : this.targetDistance += this.zoomSpeed, this.targetDistance = pc.math.clamp(this.targetDistance, 5, 20)
}, Camera.prototype.onContextMenu = function(t) {
    t.preventDefault()
}, Camera.prototype.onContextMenuWindow = function(t) {
    t.preventDefault()
}, Camera.prototype.update = function(t) {
    if (this.player) {
        if (null !== window.garakter && (1 == window.gar && (this.player = this.app.root.findByName("Player")), 2 == window.gar && (this.player = this.app.root.findByName("Sura")), this.characterEntity = this.app.root.findByName(window.garakter)), this.keyboard.isPressed(pc.KEY_INSERT) && this.keyboard.isPressed(pc.KEY_HOME)) return;
        this.keyboard.wasPressed(pc.KEY_INSERT) && !this.isChanging && (this.isChanging = !0, this.player = this.app.root.findByName("Player")), this.keyboard.wasPressed(pc.KEY_HOME) && !this.isChanging && (this.isChanging = !0, this.player = this.app.root.findByName("Sura")), this.keyboard.isPressed(pc.KEY_INSERT) || this.keyboard.isPressed(pc.KEY_HOME) || (this.isChanging = !1);
        var e = new pc.Quat;
        e.setFromEulerAngles(this.angleY, this.angleX, 0), this.distance = pc.math.lerp(this.distance, this.targetDistance, this.zoomSmoothing);
        var i = new pc.Vec3(0, 5, this.distance);
        i = e.transformVector(i), this.entity.setPosition(this.player.getPosition().x + i.x, this.player.getPosition().y + i.y, this.player.getPosition().z + i.z), this.entity.lookAt(this.player.getPosition()), window.globalCameraPosition = this.entity.getPosition().clone()
    }
};
var Attack = pc.createScript("attack");
Attack.prototype.initialize = function() {
    this.app.on("attack:startComboLoop", this.startComboLoop, this), this.app.on("attack:stopComboLoop", this.stopComboLoop, this), this.comboLoopActive = !1, this.comboLoopTimer = 0, this.characterEntity = this.app.root.findByName(window.garakter), this.comboIndex = 0, this.attackCooldown = .25, this.comboDurations = [.5, .5, .5, .5, .5, 1.25], this.comboTimer = 0, this.attackState = "idle", this.veri = 0, this.keyboard = this.app.keyboard, this.spaceIsDown = !1, this.wasBlocked = !1, this.attackHitTimes = [.3, .3, .3, .4, .45, .6], this.attackSounds = ["Attack1", "Attack2", "Attack3", "Attack4", "Attack5", "Attack6"], this.hitTriggered = !1, this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this), this.app.keyboard.on(pc.EVENT_KEYUP, this.onKeyUp, this), this.app.on("attack:handleSpaceKeyDown", this.handleSpaceKeyDown, this), this.app.on("network:handleAttack", this.handleAttack, this), this.app.on("network:handleMetinAttack", this.handleMetinAttack, this), this.app.on("network:handleBossAttack", this.handleBossAttack, this)
}, Attack.prototype.startComboLoop = function() {
    this.comboLoopActive || (this.comboLoopActive = !0, this.comboIndex = 0, this.playCombo(this.comboIndex), this.comboLoopTimer = this.comboDurations[this.comboIndex])
}, Attack.prototype.advanceComboLoop = function() {
    this.comboIndex++, this.comboIndex >= this.comboDurations.length && (this.comboIndex = 0), this.playCombo(this.comboIndex), this.comboLoopTimer = this.comboDurations[this.comboIndex]
}, Attack.prototype.stopComboLoop = function() {
    this.comboLoopActive && (this.comboLoopActive = !1, this.resetCombo())
}, Attack.prototype.onKeyDown = function(t) {
    t.key === pc.KEY_SPACE && (this.spaceIsDown = !0)
}, Attack.prototype.onKeyUp = function(t) {
    t.key === pc.KEY_SPACE && (this.spaceIsDown = !1, this.resetCombo())
}, Attack.prototype.handleSpaceKeyDown = function() {
    "idle" !== this.attackState && "cooldown" !== this.attackState || !this.spaceIsDown || this.startAttack()
}, Attack.prototype.update = function(t) {
    if (this.comboLoopActive) {
        if (this.comboLoopTimer -= t, !this.hitTriggered && this.comboDurations[this.comboIndex] - this.comboLoopTimer >= this.attackHitTimes[this.comboIndex]) {
            if (this.hitTriggered = !0, this.characterEntity.sound && this.attackSounds[this.comboIndex]) {
                var o = this.attackSounds[this.comboIndex];
                this.characterEntity.sound.slot(o).isPlaying || this.characterEntity.sound.slot(o).play()
            }
            this.app.fire("network:handleMetinAttack"), this.app.fire("network:handleBossAttack"), this.app.fire("network:handleAttack")
        }
        this.comboLoopTimer <= 0 && (this.comboIndex++, this.comboIndex >= this.comboDurations.length && (this.comboIndex = 0), this.playCombo(this.comboIndex), this.comboLoopTimer = this.comboDurations[this.comboIndex])
    } else if (this.characterEntity && this.characterEntity.anim) {
        if (this.isAttackBlocked()) return this.wasBlocked = !0, void this.resetCombo();
        switch (this.wasBlocked && this.spaceIsDown && (this.wasBlocked = !1, this.startAttack()), this.attackState) {
            case "idle":
                this.keyboard.wasPressed(pc.KEY_SPACE) && this.startAttack();
                break;
            case "attacking":
                if (this.comboTimer -= t, !this.hitTriggered && this.comboDurations[this.comboIndex] - this.comboTimer >= this.attackHitTimes[this.comboIndex]) {
                    if (this.hitTriggered = !0, this.characterEntity.sound && this.attackSounds[this.comboIndex]) {
                        o = this.attackSounds[this.comboIndex];
                        this.characterEntity.sound.slot(o).isPlaying || this.characterEntity.sound.slot(o).play()
                    }
                    this.app.fire("network:handleMetinAttack"), this.app.fire("network:handleBossAttack"), this.app.fire("network:handleAttack")
                }
                this.comboTimer <= 0 && this.spaceIsDown ? this.advanceCombo() : this.comboTimer <= 0 && this.resetCombo();
                break;
            case "cooldown":
                this.comboTimer -= t, this.comboTimer <= 0 && (this.attackState = "idle")
        }
    }
}, Attack.prototype.startAttack = function() {
    this.resetCombo(), this.attackState = "attacking", this.comboIndex = 0, this.playCombo(this.comboIndex)
}, Attack.prototype.advanceCombo = function() {
    this.comboIndex++, this.comboIndex >= this.comboDurations.length ? this.spaceIsDown ? this.startAttack() : this.resetCombo() : this.playCombo(this.comboIndex)
}, Attack.prototype.playCombo = function(t) {
    this.characterEntity.anim.setBoolean("isAttacking", !0), this.characterEntity.anim.setInteger("Combo", t + 1), this.comboTimer = this.comboDurations[t], this.hitTriggered = !1
}, Attack.prototype.resetCombo = function() {
    this.comboIndex = 0, this.comboTimer = this.attackCooldown, this.attackState = "cooldown", this.characterEntity.anim.setBoolean("isAttacking", !1), this.characterEntity.anim.setInteger("Combo", 0), this.hitTriggered = !1, this.characterEntity.sound && this.attackSounds.forEach((t => {
        this.characterEntity.sound.slot(t) && this.characterEntity.sound.slot(t).stop()
    }))
}, Attack.prototype.isAttackBlocked = function() {
    const t = this.characterEntity.anim;
    return t.getBoolean("k_cevirme") || t.getBoolean("h_kilici") || t.getBoolean("hamle") || t.getBoolean("ofke") || t.getBoolean("isDusme") || t.getBoolean("isKalkma") || t.getBoolean("uc_yonlu") || t.getBoolean("isStunning")
}, Attack.prototype.handleAttack = function() {}, Attack.prototype.handleMetinAttack = function() {}, Attack.prototype.handleBossAttack = function() {};
var ItemSistemi = pc.createScript("itemSistemi");
ItemSistemi.attributes.add("meshes", {
    type: "asset",
    array: !0,
    title: "Meshes"
}), ItemSistemi.attributes.add("textures", {
    type: "asset",
    array: !0,
    title: "Textures"
}), ItemSistemi.attributes.add("player", {
    type: "entity",
    title: "Player Entity"
}), ItemSistemi.attributes.add("warriorBodyEntity", {
    type: "entity",
    title: "Warrior Body Entity"
}), ItemSistemi.attributes.add("objectEntity", {
    type: "entity",
    title: "Object Entity"
}), ItemSistemi.prototype.initialize = function() {
    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this)
}, ItemSistemi.prototype.onKeyDown = function(t) {
    var e;
    switch (t.key) {
        case pc.KEY_1:
            e = 0;
            break;
        case pc.KEY_2:
            e = 1;
            break;
        case pc.KEY_3:
            e = 2;
            break;
        case pc.KEY_4:
            e = 3;
            break;
        default:
            return
    }
    this.changeEntityAssetAndTexture(e, this.warriorBodyEntity), this.changeEntityAssetAndTexture(e, this.objectEntity)
}, ItemSistemi.prototype.changeEntityAssetAndTexture = function(t, e) {
    if (e && e.render) {
        if (this.meshes[t] && (e.render.asset = this.meshes[t]), this.textures[t]) {
            var i = this.textures[t].resource;
            e.render.material ? (e.render.material.diffuseMap = i, e.render.material.update()) : console.warn("Render component'inin material'i bulunamadı.")
        }
    } else console.warn(e.name + " entity bulunamadı veya render component yok.")
};
! function() {
    const e = function getIosVersion() {
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            var e = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
            return [parseInt(e[1], 10), parseInt(e[2], 10), parseInt(e[3] || 0, 10)]
        }
        return null
    }();
    document.documentElement.style.setProperty("--sat", "env(safe-area-inset-top)"), document.documentElement.style.setProperty("--sab", "env(safe-area-inset-bottom)"), document.documentElement.style.setProperty("--sal", "env(safe-area-inset-left)"), document.documentElement.style.setProperty("--sar", "env(safe-area-inset-right)");
    const t = pc.Application.getApplication();
    let n = null;

    function createInputDom() {
        n && n.remove(), n = document.createElement("input"), n.setAttribute("type", "text"), n.style.position = "absolute", n.style.fontFamily = "Arial, sans-serif", n.style.background = "white", n.style.paddingLeft = "10px", n.style.paddingRight = "10px", n.style.margin = "0px", n.style.visibility = "hidden", n.style.zIndex = 1e3, resetStyle(), n.value = "", document.body.appendChild(n)
    }
    createInputDom();
    let i = !1,
        o = !1,
        l = null;

    function onInputFieldClick(e, t) {
        t.stopPropagation(),
            function showDom(e, t) {
                if (o === e) return;
                o && o !== e && onBlur();
                o = e, "visible" !== n.style.visibility && (t.changedTouches ? (t.event.preventDefault(), i = !1) : i = !0, n.style.visibility = "visible", n.onblur = onBlur, n.addEventListener("keydown", onKeyDown), n.addEventListener("keyup", onKeyUp));
                switch (n.value = e.value, n.maxLength = e.maxLength, n.placeholder = e.placeHolder, n.pattern = null, n.spellcheck = !1, e.inputType) {
                    case "text":
                    default:
                        n.type = "text", n.spellcheck = !0;
                        break;
                    case "text no spellcheck":
                        n.type = "text";
                        break;
                    case "number":
                        n.type = "number", n.pattern = "[0-9]*";
                        break;
                    case "decimal":
                        n.type = "number";
                        break;
                    case "email":
                        n.type = "email";
                        break;
                    case "password":
                        n.type = "password"
                }
                n.enterKeyHint = e.enterKeyHint, n.focus(), updateStyle(), o.entity.element.on("resize", updateStyle)
            }(e, t)
    }

    function onBlur() {
        n.onblur = null, n.removeEventListener("keydown", onKeyDown), n.removeEventListener("keyup", onKeyUp), n.style.visibility = "hidden",
            function onElementSwitch() {
                o.entity.fire("uiinput:updatevalue", n.value), o.entity.element.off("resize", updateStyle), "password" === o.inputType && createInputDom(), o = null
            }()
    }

    function onKeyDown(e) {
        e.stopPropagation()
    }

    function onKeyUp(e) {
        e.preventDefault(), e.stopPropagation(), 13 === e.keyCode && n.blur()
    }

    function resetStyle() {
        const e = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sal")),
            t = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sar"));
        n.style.left = "20px", n.style.height = "40px", n.style.width = window.innerWidth - 64 - e - t + "px", n.style.fontSize = "100%", n.style.top = "20px", n.style.marginTop = "env(safe-area-inset-top)", n.style.marginLeft = "env(safe-area-inset-left)", n.style.bottom = null
    }

    function updateStyle() {
        if (o)
            if (i && o.entity.element.screenCorners) {
                const e = o.entity.element.screenCorners,
                    i = Math.min(t.graphicsDevice.maxPixelRatio, window.devicePixelRatio);
                n.style.left = e[0].x / i - 2 + "px", n.style.bottom = e[0].y / i - 2 + "px", n.style.top = null;
                const l = (e[2].x - e[0].x) / i - 20,
                    s = (e[2].y - e[0].y) / i;
                n.style.width = l + "px", n.style.height = s + "px", n.style.fontSize = Math.round(.5 * s) + "px"
            } else resetStyle()
    }

    function onIosResizeTimeout() {
        t.on("uiinput:clicked", onInputFieldClick), l = null
    }
    e ? l = setTimeout(onIosResizeTimeout, 2100) : t.on("uiinput:clicked", onInputFieldClick), t.graphicsDevice.on("resizecanvas", (function onResize() {
        e && !l && (t.off("uiinput:clicked", onInputFieldClick), l = setTimeout(onIosResizeTimeout, 2100)), setTimeout((() => {
            updateStyle()
        }))
    }))
}();
var UiInputField = pc.createScript("uiInputField");
UiInputField.attributes.add("textEntity", {
    type: "entity",
    title: "Text Entity",
    description: "The Entity that has the text Element to update with the inputted text."
}), UiInputField.attributes.add("inputType", {
    type: "string",
    title: "Input Type",
    description: "What type of input will this field accept. On some devices, the virtual keyboard layout may change as well. For example, 'Number' will bring up a numpad instead of the full keyboard.",
    default: "text",
    enum: [{
        Text: "text"
    }, {
        "Text (no spellcheck)": "text no spellcheck"
    }, {
        Email: "email"
    }, {
        Number: "number"
    }, {
        Decimal: "decimal"
    }, {
        Password: "password"
    }]
}), UiInputField.attributes.add("enterKeyHint", {
    type: "string",
    title: "Enter Key Hint",
    description: "Change what the enter key shows on the virutal keyboard. Different OSs will have different representations of the hint.",
    default: "enter",
    enum: [{
        Enter: "enter"
    }, {
        Done: "done"
    }, {
        Go: "go"
    }, {
        Search: "search"
    }, {
        Send: "send"
    }]
}), UiInputField.attributes.add("maxLength", {
    type: "number",
    default: 32,
    title: "Max Length",
    description: "Maximum length of the text can be."
}), UiInputField.attributes.add("placeHolder", {
    type: "string",
    default: "Placeholder text...",
    title: "Place Holder String",
    description: "When the inputted text is empty, what should show as placeholder? Usually this is a prompt such as 'Enter your email here'."
}), UiInputField.attributes.add("placeHolderColor", {
    type: "rgb",
    title: "Place Holder Text Color",
    description: "What color the text should be when the placeholder string is used."
}), UiInputField.prototype.initialize = function() {
    this._textElement = this.textEntity.element, this._textColor = this._textElement.color.clone(), this.value = "", this.setEvents("on"), this.on("destroy", (() => {
        this.setEvents("off")
    })), this._onValueChange(""), this._placeHolderCounter = 0
}, UiInputField.prototype.setEvents = function(t) {
    this.entity[t]("uiinput:updatevalue", this._onValueChange, this), this.entity.element[t]("click", this._onClick, this)
}, UiInputField.prototype._onValueChange = function(t) {
    if (t.length > 0) {
        if ("password" === this.inputType) {
            let e = "";
            for (let i = 0; i < t.length; ++i) e += "*";
            this._textElement.text = e
        } else this._textElement.text = t;
        this._textElement.color = this._textColor, this._placeHolderCounter++, this._placeHolderCounter % 2 == 1 ? this.placeHolder = "Pass.." : this.placeHolder = "Id.."
    } else this._textElement.text = this.placeHolder, this._textElement.color = this.placeHolderColor;
    this.entity.fire("updatedvalue", t)
}, UiInputField.prototype._onClick = function(t) {
    this.app.fire("uiinput:clicked", this, t)
};
var Textler = pc.createScript("textler");
Textler.attributes.add("kayitEntity", {
    type: "entity"
}), Textler.attributes.add("girisEntity", {
    type: "entity"
}), Textler.attributes.add("buttonEntity", {
    type: "entity"
}), Textler.attributes.add("player_hpEntity", {
    type: "entity"
}), Textler.attributes.add("player_svs_gucuEntity", {
    type: "entity"
}), Textler.attributes.add("health_barEntity", {
    type: "entity"
}), window.globalPlayerId = null, Textler.prototype.initialize = function() {
    this.previousText = this.entity.element ? this.entity.element.text : null, this.textChanges = [], this.isAutoUpdating = !1
}, Textler.prototype.update = function(t) {
    if (this.entity.element && this.entity.element.text !== this.previousText) {
        if (this.isAutoUpdating) return this.isAutoUpdating = !1, console.log(`Automatic update to: ${this.entity.element.text}`), void(this.previousText = this.entity.element.text);
        console.log(`Text of "${this.entity.name}" changed to: ${this.entity.element.text}`), this.previousText = this.entity.element.text, this.textChanges.push(this.entity.element.text), 1 === this.textChanges.length && this.switchToPasswordPrompt(), 2 === this.textChanges.length && this.checkTexts()
    }
}, Textler.prototype.switchToPasswordPrompt = function() {
    setTimeout((() => {
        this.entity.element && (this.isAutoUpdating = !0, this.entity.element.text = "Pass..")
    }), 500)
}, Textler.prototype.resetToIdPrompt = function() {
    setTimeout((() => {
        this.entity.element && (this.isAutoUpdating = !0, this.entity.element.text = "Id..")
    }), 500)
}, Textler.prototype.checkTexts = function() {
    const [t, e] = this.textChanges;
    this.verifyPlayerData(t, e)
}, Textler.prototype.verifyPlayerData = function(t, e) {
    const i = {
        player_id: t,
        player_pass: e
    };
    fetch("https://www.m2w2.com.tr/loadPlayerData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(i)
    }).then((t => t.json())).then((e => {
        if ("success" === e.status) {
            if (console.log("Bilgiler doğru, başarıyla giriş yapılıyor.."), this.destroyTextElement(), this.buttonEntity.destroy(), window.globalPlayerId = t, this.girisEntity) {
                var i = this.girisEntity.script.karakter_ozellikleri;
                i ? i.setPlayerId(t) : console.log("Karakter özellikleri script'i bulunamadı!"), this.girisEntity.enabled = !1, this.player_hpEntity.enabled = !0, this.player_svs_gucuEntity.enabled = !0, this.health_barEntity.enabled = !0
            }
        } else console.log("Bilgiler hatalı! Tekrar deneyin."), this.textChanges = [], this.resetToIdPrompt()
    })).catch((t => {
        console.error("Veri doğrulama sırasında hata oluştu:", t)
    }))
}, Textler.prototype.destroyTextElement = function() {
    this.entity.element && (this.entity.element.text = "", this.entity.destroy(), console.log(`Text element of "${this.entity.name}" destroyed.`))
};
var VeriTabani = pc.createScript("veri_tabani");
VeriTabani.attributes.add("kayitEntity", {
    type: "entity"
}), VeriTabani.attributes.add("girisEntity", {
    type: "entity"
}), VeriTabani.prototype.initialize = function() {
    this.previousText = this.entity.element ? this.entity.element.text : null, this.textChanges = [], this.player_id = "", this.player_pass = "", this.isAutoUpdating = !1
}, VeriTabani.prototype.update = function(t) {
    if (this.entity.element && this.entity.element.text !== this.previousText) {
        if (this.isAutoUpdating) return this.isAutoUpdating = !1, console.log(`Automatic update to: ${this.entity.element.text}`), void(this.previousText = this.entity.element.text);
        console.log(`Text of "${this.entity.name}" changed to: ${this.entity.element.text}`), this.previousText = this.entity.element.text, this.textChanges.push(this.entity.element.text), 1 === this.textChanges.length && this.switchToPasswordPrompt(), 2 === this.textChanges.length && this.processPlayerData()
    }
}, VeriTabani.prototype.switchToPasswordPrompt = function() {
    setTimeout((() => {
        this.entity.element && (this.isAutoUpdating = !0, this.entity.element.text = "Pass..")
    }), 500)
}, VeriTabani.prototype.processPlayerData = function() {
    const [t, e] = this.textChanges;
    this.player_id = t, this.player_pass = e, console.log(`Player ID: ${this.player_id}`), console.log(`Player Pass: ${this.player_pass}`), this.saveToDatabase(this.player_id, this.player_pass), this.textChanges = []
}, VeriTabani.prototype.saveToDatabase = function(t, e) {
    const i = {
        player_id: t,
        player_pass: e
    };
    fetch("https://www.m2w2.com.tr/savePlayerData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(i)
    }).then((t => t.json())).then((t => {
        console.log("Veri başarıyla kaydedildi:", t), t.error ? (console.log("Hata:", t.error), this.handleError()) : (this.destroyTextElement(), this.kayitEntity && (this.kayitEntity.enabled = !1), this.girisEntity && (this.girisEntity.enabled = !0))
    })).catch((t => {
        console.error("Veri kaydedilirken bir hata oluştu:", t), this.handleError()
    }))
}, VeriTabani.prototype.handleError = function() {
    this.kayitEntity && (this.kayitEntity.enabled = !0), this.girisEntity && (this.girisEntity.enabled = !1), this.textChanges = [], this.entity.element && (this.isAutoUpdating = !0, this.entity.element.text = "Id.."), console.log("Veri kaydedilmedi. Tekrar giriş yapın.")
}, VeriTabani.prototype.destroyTextElement = function() {
    this.entity.element && (this.entity.element.text = "", this.entity.destroy(), console.log(`Text element of "${this.entity.name}" destroyed.`))
};
var KayitButton = pc.createScript("kayit_button");
KayitButton.attributes.add("kayitEntity", {
    type: "entity"
}), KayitButton.attributes.add("girisEntity", {
    type: "entity"
}), KayitButton.prototype.initialize = function() {
    this.entity.element.on("click", this.onButtonClick, this)
}, KayitButton.prototype.onButtonClick = function() {
    console.log("basildi"), this.entity.destroy(), this.girisEntity && (this.girisEntity.enabled = !1), this.kayitEntity && (this.kayitEntity.enabled = !0)
};
var KarakterOzellikleri = pc.createScript("karakter_ozellikleri");
KarakterOzellikleri.prototype.initialize = function() {
    this.player_id = "", this.player_hp = 2e4, this.player_svs_gucu = 500, this.app.on("damage:apply", this.applyDamage, this)
}, KarakterOzellikleri.prototype.setPlayerId = function(e) {
    this.player_id = e, console.log(`Player ID set: ${this.player_id}`), this.loadCharacterData()
}, KarakterOzellikleri.prototype.loadCharacterData = function() {
    if (!this.player_id) return void console.log("Oyuncu ID'si geçerli değil!");
    const e = {
        player_id: this.player_id
    };
    fetch("https://www.m2w2.com.tr/loadCharacterData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    }).then((e => e.json())).then((e => {
        e.error ? console.log("Veri yüklenemedi:", e.error) : (this.player_hp = e.player_hp || 2e4, this.player_svs_gucu = e.player_svs_gucu || 500, console.log("Karakter bilgileri yüklendi:", e), this.updateCharacterStats())
    })).catch((e => {
        console.error("Veri yükleme sırasında hata:", e)
    }))
}, KarakterOzellikleri.prototype.updateCharacterStats = function() {
    console.log(`Karakter HP: ${this.player_hp}`), console.log(`Karakter SvS Gücü: ${this.player_svs_gucu}`)
}, KarakterOzellikleri.prototype.changeHP = function(e) {
    this.player_hp += e, console.log(`Yeni HP: ${this.player_hp}`), this.saveCharacterData()
}, KarakterOzellikleri.prototype.saveCharacterData = function() {
    const e = {
        player_id: this.player_id,
        player_hp: this.player_hp,
        player_svs_gucu: this.player_svs_gucu
    };
    fetch("https://www.m2w2.com.tr/saveCharacterData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    }).then((e => e.json())).then((e => {
        e.error ? console.log("Veri kaydedilemedi:", e.error) : console.log("Karakter bilgileri başarıyla kaydedildi:", e)
    })).catch((e => {
        console.error("Veri kaydederken hata:", e)
    }))
}, KarakterOzellikleri.prototype.applyDamage = function(e, a) {
    this.player_id === a && (console.log(`Hasar alındı: ${e}`), this.changeHP(-e))
};
var PlayerHP = pc.createScript("player_hp");
PlayerHP.prototype.initialize = function() {
    window.globalPlayerId && (this.playerId = window.globalPlayerId, this.characterEntity = this.app.root.findByName(window.garakter), this.keyboard = this.app.keyboard, this.isChanging = !1, this.loadPlayerHP(), this.hpUpdateInterval = setInterval(this.loadPlayerHP.bind(this), 250))
}, PlayerHP.prototype.update = function(t) {
    this.keyboard.isPressed(pc.KEY_INSERT) && this.keyboard.isPressed(pc.KEY_HOME) || (this.keyboard.wasPressed(pc.KEY_INSERT) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("savasciCharacter")), this.keyboard.wasPressed(pc.KEY_HOME) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("suraCharacter")), this.keyboard.isPressed(pc.KEY_INSERT) || this.keyboard.isPressed(pc.KEY_HOME) || (this.isChanging = !1))
}, PlayerHP.prototype.loadPlayerHP = function() {
    const t = {
        player_id: this.playerId
    };
    fetch("https://www.m2w2.com.tr/loadCharacterData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(t)
    }).then((t => t.json())).then((t => {
        if (t.error) return void console.error("Veri yüklenirken hata:", t.error);
        let e = t.player_hp;
        void 0 !== e ? (e < 0 && (e = 0), window.currentPlayerHp = e, this.characterEntity && this.characterEntity.anim && this.characterEntity.anim.setBoolean("isDead", e <= 0), this.entity && this.entity.element ? this.entity.element.text = `HP: ${e}` : console.error('Bu entity bir "element" içermiyor. Metin değeri güncellenemedi.')) : console.error("Player HP bilgisi bulunamadı!")
    })).catch((t => {
        console.error("API çağrısı sırasında hata oluştu:", t)
    }))
}, PlayerHP.prototype.destroy = function() {
    this.hpUpdateInterval && clearInterval(this.hpUpdateInterval)
};
var PlayerSVSGucu = pc.createScript("player_svs_gucu");
PlayerSVSGucu.prototype.initialize = function() {
    window.globalPlayerId ? (this.playerId = window.globalPlayerId, this.loadPlayerSVSGucu(), this.svsGucuUpdateInterval = setInterval(this.loadPlayerSVSGucu.bind(this), 250)) : console.error("Global Player ID belirlenmemiş. Veriyi yükleyemiyor!")
}, PlayerSVSGucu.prototype.loadPlayerSVSGucu = function() {
    const e = {
        player_id: this.playerId
    };
    fetch("https://www.m2w2.com.tr/loadCharacterData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    }).then((e => e.json())).then((e => {
        if (e.error) return void console.error("Veri yüklenirken hata:", e.error);
        const r = e.player_svs_gucu;
        void 0 !== r ? (window.globalPlayerSVSGucu = r, this.entity && this.entity.element ? this.entity.element.text = `Svs Gucu: ${r}` : console.error('Bu entity bir "element" içermiyor. Metin değeri güncellenemedi.')) : console.error("Player SVS Gücü bilgisi bulunamadı!")
    })).catch((e => {
        console.error("API çağrısı sırasında hata oluştu:", e)
    }))
}, PlayerSVSGucu.prototype.destroy = function() {
    this.svsGucuUpdateInterval && clearInterval(this.svsGucuUpdateInterval)
};
var ProgressBar = pc.createScript("progressBar");
ProgressBar.attributes.add("progressImage", {
    type: "entity"
}), ProgressBar.attributes.add("progressImageMaxWidth", {
    type: "number"
}), ProgressBar.attributes.add("maxHP", {
    type: "number",
    default: 2e4
}), ProgressBar.prototype.initialize = function() {
    this.app.on("Player:PlayerDamage", this.displayDamageText, this), this.imageRect = this.progressImage.element.rect.clone(), this.lastHp = null, window.globalPlayerId ? (this.playerId = window.globalPlayerId, this.loadPlayerHP(), this.hpUpdateInterval = setInterval(this.loadPlayerHP.bind(this), 250)) : console.error("Global Player ID belirlenmemiş. HP bar güncellenemeyecek.")
}, ProgressBar.prototype.loadPlayerHP = function() {
    const e = {
        player_id: this.playerId
    };
    let t = [];
    t.push(this.entity._guid), this.playerTargetGuids = t, fetch("https://www.m2w2.com.tr/loadCharacterData.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    }).then((e => e.json())).then((e => {
        if (e.error) return void console.error("Veri yüklenirken hata:", e.error);
        const t = e.player_hp;
        if (void 0 !== t) {
            if (this.maxHP && 2e4 !== this.maxHP || (this.maxHP = 2e4), null !== this.lastHp) {
                const e = this.lastHp - t;
                e > 0 && (console.log(`HP kaybı: ${e}`), this.app.fire("Player:PlayerDamage", {
                    damageAmount: e,
                    guid: this.playerTargetGuids
                }))
            }
            this.lastHp = t;
            var r = t / this.maxHP;
            this.setProgress(r)
        } else console.error("Player HP bilgisi bulunamadı!")
    })).catch((e => {
        console.error("API çağrısı sırasında hata oluştu:", e)
    }))
}, ProgressBar.prototype.destroy = function() {
    this.hpUpdateInterval && clearInterval(this.hpUpdateInterval)
}, ProgressBar.prototype.setProgress = function(e) {
    e = pc.math.clamp(e, 0, 1), this.progress = e;
    var t = pc.math.lerp(0, this.progressImageMaxWidth, e);
    this.progressImage.element.width = t, this.imageRect.copy(this.progressImage.element.rect), this.imageRect.z = e, this.progressImage.element.rect = this.imageRect
};
var SkillKCevirme = pc.createScript("skillKCevirme");
window.isSkillKCevirmeActive = !0, setTimeout((() => {
    window.isSkillKCevirmeActive = !1
}), this.animationDuration), window.isSkillActive = !1, SkillKCevirme.prototype.initialize = function() {
    this.skillLocked = !1, this.skillDuration = 3e3, this.animationDuration = 1980, this.keyboard = this.app.keyboard, this.isChanging = !1, this.characterEntity = this.app.root.findByName("savasciCharacter"), this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this)
}, SkillKCevirme.prototype.update = function(i) {
    null !== window.garakter && (this.characterEntity = this.app.root.findByName(window.garakter)), this.keyboard.isPressed(pc.KEY_INSERT) && this.keyboard.isPressed(pc.KEY_HOME) || (this.keyboard.wasPressed(pc.KEY_INSERT) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("savasciCharacter")), this.keyboard.wasPressed(pc.KEY_HOME) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("suraCharacter")), this.keyboard.isPressed(pc.KEY_INSERT) || this.keyboard.isPressed(pc.KEY_HOME) || (this.isChanging = !1))
}, SkillKCevirme.prototype.onKeyDown = function(i) {
    i.key === pc.KEY_F2 && (i.event.preventDefault(), this.characterEntity.anim.getBoolean("isStunning") || window.isSkillActive || this.skillLocked || this.characterEntity.anim.getBoolean("isDead") || this.characterEntity.anim.getBoolean("isDusme") || this.characterEntity.anim.getBoolean("isKalkma") || this.activateSkill())
}, SkillKCevirme.prototype.activateSkill = function() {
    this.skillLocked = !0, window.isSkillActive = !0, window.isSkillKCevirmeActive = !0, this.characterEntity.anim && this.characterEntity.anim.setBoolean("k_cevirme", !0), this.characterEntity.sound && this.characterEntity.sound.slot("k_cevirme") && (this.characterEntity.sound.slot("k_cevirme").play(), this.characterEntity.sound.slot("k_cevirme_voice").play()), setTimeout((() => {
        this.characterEntity.anim && this.characterEntity.anim.setBoolean("k_cevirme", !1), window.isSkillActive = !1, window.isSkillKCevirmeActive = !1, this.skillLocked = !1, this.app.keyboard.isPressed(pc.KEY_SPACE) && (this.characterEntity.anim.setBoolean("isAttacking", !0), this.app.fire("attack:handleSpaceKeyDown"))
    }), this.animationDuration)
}, SkillKCevirme.prototype.onDisable = function() {
    this.app.keyboard.off(pc.EVENT_KEYDOWN, this.onKeyDown, this)
};
var KCevirme = pc.createScript("kCevirme");
KCevirme.attributes.add("otherEntity", {
    type: "entity"
}), KCevirme.attributes.add("newTexture", {
    type: "asset",
    assetType: "texture"
}), KCevirme.attributes.add("originalTexture", {
    type: "asset",
    assetType: "texture"
}), window.onAttack = !1, window.k_cevirme = !1, KCevirme.prototype.initialize = function() {
    this.characterEntity = this.app.root.findByName("savasciCharacter"), this.effectEntity = this.app.root.findByName("sav_f2Basinca"), this.keyboard = this.app.keyboard, this.app.on("TextEntity:UpdateContent", this.updateTextContent, this), this.app.on("network:skillAttack", this.skillAttack, this), this.isChanging = !1, this.skillLocked = !1, this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this)
}, KCevirme.prototype.update = function(t) {
    null !== window.garakter && (this.characterEntity = this.app.root.findByName(window.garakter), this.effectEntity = this.app.root.findByName(window.f2)), this.keyboard.isPressed(pc.KEY_INSERT) && this.keyboard.isPressed(pc.KEY_HOME) || (this.keyboard.wasPressed(pc.KEY_INSERT) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("savasciCharacter")), this.keyboard.wasPressed(pc.KEY_HOME) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("suraCharacter")), this.keyboard.isPressed(pc.KEY_INSERT) || this.keyboard.isPressed(pc.KEY_HOME) || (this.isChanging = !1))
}, KCevirme.prototype.onKeyDown = function(t) {
    t.key !== pc.KEY_F2 || this.characterEntity.anim.getBoolean("isStunning") || window.isSkillActive || this.skillLocked || this.characterEntity.anim.getBoolean("isDead") || this.characterEntity.anim.getBoolean("isDusme") || this.characterEntity.anim.getBoolean("isKalkma") || (window.k_cevirme = !0, this.activateSkill(), window.onAttack = !0)
}, KCevirme.prototype.activateSkill = function() {
    this.skillLocked = !0, this.app.fire("network:skillAttack"), this.effectEntity && setTimeout((() => {
        this.effectEntity.enabled = !0, setTimeout((() => {
            this.effectEntity.enabled = !1
        }), 1e3)
    }), 500);
    var t = this.entity.element;
    this.newTexture ? (this.fadeTexture(t, this.newTexture.resource, .5), setTimeout((() => {
        this.originalTexture && this.fadeTexture(t, this.originalTexture.resource, .5)
    }), 3e3)) : console.log("Yeni texture yok!"), setTimeout((() => {
        this.skillLocked = !1, window.onAttack = !0, window.k_cevirme = !1
    }), 3e3)
}, KCevirme.prototype.fadeTexture = function(t, e, i) {
    t.opacity;
    var a = Date.now(),
        s = a + 1e3 * i / 2,
        n = setInterval((function() {
            var r = (Date.now() - a) / (s - a);
            if (r >= 1) {
                clearInterval(n), t.opacity = 0, t.texture = e, a = Date.now(), s = a + 1e3 * i / 2;
                var o = setInterval((function() {
                    var e = (Date.now() - a) / (s - a);
                    e >= 1 ? (clearInterval(o), t.opacity = 1) : t.opacity = e
                }), 16)
            } else t.opacity = 1 - r
        }), 16)
}, KCevirme.prototype.onDisable = function() {
    this.app.keyboard.off(pc.EVENT_KEYDOWN, this.onKeyDown, this)
};
var TakeDamage = pc.createScript("takeDamage");
TakeDamage.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamage.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.entity.element.opacity = 0, this.entity.element.outlineThickness = 0, console.log("TakeDamage script initialized, entity is initially invisible."), this.animating = !1, this.app.on("Player:OtherDamage", this.onFakeDamageEvent, this)
}, TakeDamage.prototype.onFakeDamageEvent = function(t) {
    const {
        damageAmount: e,
        guid: a
    } = t, i = Array.isArray(a) ? a : a.split(","), n = this.entity.parent;
    if (!n) return void console.error("Ana entity bulunamadı!");
    n._guid;
    let o = !1;
    i.forEach((t => {
        const a = this.app.root.findByGuid(t.trim());
        if (a) {
            n.getPosition().distance(a.getPosition()) <= 2 && (o = !0, this.displayDamageText(e))
        }
    }))
}, TakeDamage.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, TakeDamage.prototype.displayDamageText = function(t) {
    this.animating || (this.showDamageText(t), this.app.on("update", this.update, this))
}, TakeDamage.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        (new pc.Quat).copy(e).invert(), this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
}, TakeDamage.prototype.showDamageText = function(t) {
    this.entity.element.text = t, this.entity.element.opacity = 1, this.entity.element.outlineThickness = .6, this.entity.setLocalScale(.01, .01, .01), this.entity.setLocalPosition(0, 2, 0), this.animateText()
}, TakeDamage.prototype.animateText = function() {
    var t = this,
        e = Date.now(),
        a = t.entity.element.outlineThickness || .6;
    t.app.on("update", (function animate(i) {
        var n = (Date.now() - e) / 1e3 / .4;
        if (n < 1) {
            var o = pc.math.lerp(.01, .015, n);
            t.entity.setLocalScale(o, o, o);
            var s = pc.math.lerp(1, .9, n);
            t.entity.element.opacity = s;
            var p = pc.math.lerp(a, .5, n);
            t.entity.element.outlineThickness = p;
            var m = pc.math.lerp(2, 2.7, n),
                r = 0 + .5 * Math.sin(n * Math.PI),
                l = t.entity.getLocalPosition();
            t.entity.setLocalPosition(l.x, m, r)
        } else t.entity.element.opacity = 0, t.entity.element.outlineThickness = 0, t.app.off("update", animate)
    }))
};
var TakeDamage = pc.createScript("otherDamage");
TakeDamage.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamage.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.entity.element.opacity = 0, this.entity.element.outlineThickness = 0, console.log("TakeDamage script initialized, entity is initially invisible."), this.animating = !1, this.app.on("Player:PlayerDamage", this.onFakeDamageEvent, this)
}, TakeDamage.prototype.onFakeDamageEvent = function(t) {
    const {
        damageAmount: e,
        guid: a
    } = t, i = Array.isArray(a) ? a : a.split(",");
    this.entity.parent ? i.forEach((t => {
        this.app.root.findByGuid(t.trim()) ? this.displayDamageText(e) : console.error(`GUID ile eşleşen bir entity bulunamadı. Gelen GUID: ${t}`)
    })) : console.error("Ana entity bulunamadı!")
}, TakeDamage.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, TakeDamage.prototype.displayDamageText = function(t) {
    this.animating || (this.showDamageText(t), this.app.on("update", this.update, this))
}, TakeDamage.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        (new pc.Quat).copy(e).invert(), this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
}, TakeDamage.prototype.showDamageText = function(t) {
    this.entity.element.text = t, this.entity.element.opacity = 1, this.entity.element.outlineThickness = .6, this.entity.setLocalScale(.01, .01, .01), this.entity.setLocalPosition(0, 2, 0), this.animateText()
}, TakeDamage.prototype.animateText = function() {
    var t = this,
        e = Date.now(),
        a = t.entity.element.outlineThickness || .6;
    t.app.on("update", (function animate(i) {
        var n = (Date.now() - e) / 1e3 / .4;
        if (n < 1) {
            var o = pc.math.lerp(.01, .015, n);
            t.entity.setLocalScale(o, o, o);
            var s = pc.math.lerp(1, .9, n);
            t.entity.element.opacity = s;
            var p = pc.math.lerp(a, .5, n);
            t.entity.element.outlineThickness = p;
            var r = pc.math.lerp(2, 2.7, n),
                m = 0 + .5 * Math.sin(n * Math.PI),
                l = t.entity.getLocalPosition();
            t.entity.setLocalPosition(l.x, r, m)
        } else t.entity.element.opacity = 0, t.entity.element.outlineThickness = 0, t.app.off("update", animate)
    }))
};
var HKilici = pc.createScript("hKilici");
HKilici.attributes.add("otherEntity", {
    type: "entity"
}), HKilici.attributes.add("textEntity", {
    type: "entity"
}), HKilici.attributes.add("flashEffectEntity", {
    type: "entity"
}), HKilici.prototype.initialize = function() {
    this.characterEntity = this.app.root.findByName("savasciCharacter"), this.f3BasincaEntity = this.app.root.findByName("sav_f3Basinca"), this.f3SurekliEntity = this.app.root.findByName("sav_f3Surekli"), this.keyboard = this.app.keyboard, this.skillLocked = !1, this.countdownInterval = null, this.isChanging = !1, this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this)
}, HKilici.prototype.update = function(t) {
    null !== window.garakter && (this.characterEntity = this.app.root.findByName(window.garakter), this.f3BasincaEntity = this.app.root.findByName(window.f3basinca), this.f3SurekliEntity = this.app.root.findByName(window.f3surekli)), this.keyboard.isPressed(pc.KEY_INSERT) && this.keyboard.isPressed(pc.KEY_HOME) || (this.keyboard.wasPressed(pc.KEY_INSERT) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("savasciCharacter"), console.log("basıldı")), this.keyboard.wasPressed(pc.KEY_HOME) && !this.isChanging && (this.isChanging = !0, this.characterEntity = this.app.root.findByName("suraCharacter")), this.keyboard.isPressed(pc.KEY_INSERT) || this.keyboard.isPressed(pc.KEY_HOME) || (this.isChanging = !1))
}, HKilici.prototype.onKeyDown = function(t) {
    t.key === pc.KEY_F3 && (t.event.preventDefault(), this.characterEntity.anim.getBoolean("isStunning") || window.isSkillActive || this.skillLocked || this.characterEntity.anim.getBoolean("isDead") || this.characterEntity.anim.getBoolean("isDusme") || this.characterEntity.anim.getBoolean("isKalkma") || this.activateSkill())
}, HKilici.prototype.activateSkill = function() {
    this.skillLocked = !0;
    var t = this.entity.element;
    window.str_value += 150, t && this.animateColor(t, new pc.Color(.541, .541, .541), new pc.Color(1, 1, 1), 30), this.f3BasincaEntity && (this.f3BasincaEntity.enabled = !0, setTimeout((() => {
        this.f3BasincaEntity.enabled = !1
    }), 1e3)), this.f3SurekliEntity && (this.f3SurekliEntity.enabled = !0), this.textEntity && this.startCountdown(this.textEntity, 30), setTimeout((() => {
        this.f3SurekliEntity && (this.f3SurekliEntity.enabled = !1)
    }), 3e4), setTimeout((() => {
        this.skillLocked = !1, window.str_value -= 150, this.flashEffectEntity && this.flashEffect(this.flashEffectEntity, 500)
    }), 3e4)
}, HKilici.prototype.animateColor = function(t, i, e, n) {
    var a = Date.now(),
        s = a + 1e3 * n,
        o = setInterval((function() {
            var n = (Date.now() - a) / (s - a);
            n >= 1 ? (clearInterval(o), t.color = e) : t.color = new pc.Color(i.r + (e.r - i.r) * n, i.g + (e.g - i.g) * n, i.b + (e.b - i.b) * n)
        }), 16)
}, HKilici.prototype.flashEffect = function(t, i) {
    t && t.element && (t.element.color = new pc.Color(1, 1, 0), setTimeout((() => {
        t.element.color = new pc.Color(1, 1, 1)
    }), i))
}, HKilici.prototype.startCountdown = function(t, i) {
    var e = i;
    this.countdownInterval && clearInterval(this.countdownInterval), t.enabled = !0, t.element.text = e.toString(), this.countdownInterval = setInterval((() => {
        --e <= 0 ? (clearInterval(this.countdownInterval), this.countdownInterval = null, t.enabled = !1) : t.element.text = e.toString()
    }), 1e3)
}, HKilici.prototype.onDisable = function() {
    this.app.keyboard.off(pc.EVENT_KEYDOWN, this.onKeyDown, this), this.countdownInterval && clearInterval(this.countdownInterval)
};
var ItemOzellikleri = pc.createScript("itemOzellikleri");
ItemOzellikleri.attributes.add("ozellikEntity", {
    type: "entity"
}), ItemOzellikleri.prototype.initialize = function() {
    this.entity.element && (this.entity.element.on("mouseenter", this.onMouseEnter, this), this.entity.element.on("mouseleave", this.onMouseLeave, this))
}, ItemOzellikleri.prototype.onMouseEnter = function() {
    window.onSocket_1 && this.ozellikEntity && (this.ozellikEntity.enabled = !0)
}, ItemOzellikleri.prototype.onMouseLeave = function() {
    this.ozellikEntity && (this.ozellikEntity.enabled = !1)
};
var ItemOzellikleri = pc.createScript("itemOzellikleri2");
ItemOzellikleri.attributes.add("ozellikEntity", {
    type: "entity"
}), ItemOzellikleri.prototype.initialize = function() {
    this.entity.element && (this.entity.element.on("mouseenter", this.onMouseEnter, this), this.entity.element.on("mouseleave", this.onMouseLeave, this))
}, ItemOzellikleri.prototype.onMouseEnter = function() {
    window.onSocket_2 && this.ozellikEntity && (this.ozellikEntity.enabled = !0)
}, ItemOzellikleri.prototype.onMouseLeave = function() {
    this.ozellikEntity && (this.ozellikEntity.enabled = !1)
};
var ItemOzellikleri = pc.createScript("itemOzellikleri3");
ItemOzellikleri.attributes.add("ozellikEntity", {
    type: "entity"
}), ItemOzellikleri.prototype.initialize = function() {
    this.entity.element && (this.entity.element.on("mouseenter", this.onMouseEnter, this), this.entity.element.on("mouseleave", this.onMouseLeave, this))
}, ItemOzellikleri.prototype.onMouseEnter = function() {
    window.onSocket_3 && this.ozellikEntity && (this.ozellikEntity.enabled = !0)
}, ItemOzellikleri.prototype.onMouseLeave = function() {
    this.ozellikEntity && (this.ozellikEntity.enabled = !1)
};
var ItemOzellikleri = pc.createScript("itemOzellikleri4");
ItemOzellikleri.attributes.add("ozellikEntity", {
    type: "entity"
}), ItemOzellikleri.prototype.initialize = function() {
    this.entity.element && (this.entity.element.on("mouseenter", this.onMouseEnter, this), this.entity.element.on("mouseleave", this.onMouseLeave, this))
}, ItemOzellikleri.prototype.onMouseEnter = function() {
    window.onSocket_4 && this.ozellikEntity && (this.ozellikEntity.enabled = !0)
}, ItemOzellikleri.prototype.onMouseLeave = function() {
    this.ozellikEntity && (this.ozellikEntity.enabled = !1)
};
var ItemOzellikleri = pc.createScript("itemOzellikleri5");
ItemOzellikleri.attributes.add("ozellikEntity", {
    type: "entity"
}), ItemOzellikleri.prototype.initialize = function() {
    this.entity.element && (this.entity.element.on("mouseenter", this.onMouseEnter, this), this.entity.element.on("mouseleave", this.onMouseLeave, this))
}, ItemOzellikleri.prototype.onMouseEnter = function() {
    window.onSocket_5 && this.ozellikEntity && (this.ozellikEntity.enabled = !0)
}, ItemOzellikleri.prototype.onMouseLeave = function() {
    this.ozellikEntity && (this.ozellikEntity.enabled = !1)
};
var ChangeEfsun = pc.createScript("changeEfsun");
ChangeEfsun.attributes.add("ortalamaZarar", {
    type: "entity"
}), ChangeEfsun.attributes.add("beceriHasari", {
    type: "entity"
}), ChangeEfsun.prototype.initialize = function() {
    this.isRunning = !1, this.efsünInterval = null, this.currentPositiveValue = null, this.efsunHakki = !0, this.isRunning || this.loadEfsunData(), window.addEventListener("keydown", this.onKeyDown.bind(this)), window.addEventListener("keyup", this.onKeyUp.bind(this))
}, ChangeEfsun.prototype.loadEfsunData = function() {
    if (window.globalPlayerId) {
        var a = String(window.globalPlayerId);
        a = `${a}`;
        var e = "https://www.m2w2.com.tr/loadEfsunData.php?user_id=" + encodeURIComponent(a);
        fetch(e).then((a => a.json())).then((a => {
            a ? (window.ortalamaZarar = a.ortalamaZarar, window.ortalamaZararColor = a.ortalamaColor, window.beceriHasari = a.beceriHasari, window.beceriHasariColor = a.beceriColor, this.setText(this.ortalamaZarar, `Ortalama Zarar %${window.ortalamaZarar}`, window.ortalamaZararColor), this.setText(this.beceriHasari, `Beceri Hasarı %${window.beceriHasari}`, window.beceriHasariColor)) : console.error("Veriler yüklenirken bir hata oluştu.")
        })).catch((a => {
            console.error("API isteği başarısız:", a)
        }))
    } else console.error("Global oyuncu kimliği bulunamadı!")
}, ChangeEfsun.prototype.onKeyDown = function(a) {
    "e" === a.key && this.efsunHakki && !this.isRunning && window.globalPlayerId && window.onSocket_1 && (this.isRunning = !0, this.efsünInterval = setInterval((() => {
        var a, e;
        Math.random() > .5 ? (a = this.getRandomPositiveValue(60), e = this.calculateNegativeValue(a, 1, 30), this.setText(this.ortalamaZarar, `Ortalama Zarar %${a}`, "B3E89E"), this.setText(this.beceriHasari, `Beceri Hasarı %${e}`, "FA614C")) : (a = this.getRandomPositiveValue(30), e = this.calculateSkillNegativeValue(a, 1, 25), this.setText(this.beceriHasari, `Beceri Hasarı %${a}`, "B3E89E"), this.setText(this.ortalamaZarar, `Ortalama Zarar %${e}`, "FA614C")), this.currentPositiveValue = a, a >= 50 && this.efsünInterval && this.currentPositiveValue === a && (clearInterval(this.efsünInterval), this.efsünInterval = null, this.efsunHakki = !1, this.saveToDatabase(), console.log(`Efsun geldi: Ortalama Zarar %${a}`))
    }), 100)), "b" === a.key && this.efsunHakki && !this.isRunning && window.globalPlayerId && window.onSocket_1 && (this.isRunning = !0, this.efsünInterval = setInterval((() => {
        var a, e;
        Math.random() > .5 ? (a = this.getRandomPositiveValue(60), e = this.calculateNegativeValue(a, 1, 30), this.setText(this.ortalamaZarar, `Ortalama Zarar %${a}`, "B3E89E"), this.setText(this.beceriHasari, `Beceri Hasarı %${e}`, "FA614C")) : (a = this.getRandomPositiveValue(30), e = this.calculateSkillNegativeValue(a, 1, 25), this.setText(this.beceriHasari, `Beceri Hasarı %${a}`, "B3E89E"), this.setText(this.ortalamaZarar, `Ortalama Zarar %${e}`, "FA614C")), this.currentPositiveValue = a, a >= 20 && e <= -40 && this.efsünInterval && this.currentPositiveValue === a && (clearInterval(this.efsünInterval), this.efsünInterval = null, this.efsunHakki = !1, this.saveToDatabase(), console.log(`Efsun geldi: Beceri Hasarı %${a}, Negatif Değer %${e}`))
    }), 100))
}, ChangeEfsun.prototype.onKeyUp = function(a) {
    "e" !== a.key && "b" !== a.key || (this.isRunning = !1, this.efsünInterval && (clearInterval(this.efsünInterval), this.efsünInterval = null))
}, ChangeEfsun.prototype.getRandomPositiveValue = function(a) {
    for (var e = [], t = 1; t <= a; t++) e.push(1 / t);
    var r = e.reduce(((a, e) => a + e), 0),
        i = Math.random() * r;
    for (t = 0; t < e.length; t++) {
        if (i < e[t]) return t + 1;
        i -= e[t]
    }
    return a
}, ChangeEfsun.prototype.calculateNegativeValue = function(a, e, t) {
    var r = (a - 10) / 40;
    return r = Math.max(0, Math.min(1, r)), -Math.floor(e + r * (t - e))
}, ChangeEfsun.prototype.calculateSkillNegativeValue = function(a, e, t) {
    var r = (a - 10) / 20;
    return r = Math.max(0, Math.min(1, r)), -Math.floor(e + 2 * r * (t - e))
}, ChangeEfsun.prototype.setText = function(a, e, t) {
    a && a.element && (a.element.text = e || "Değer Bulunamadı", a.element.color = this.hexToRgb(t), a === this.ortalamaZarar ? (window.ortalamaZarar = e, window.ortalamaZararColor = t) : a === this.beceriHasari && (window.beceriHasari = e, window.beceriHasariColor = t))
}, ChangeEfsun.prototype.saveToDatabase = function() {
    if (window.globalPlayerId) {
        var a = {
            playerId: window.globalPlayerId,
            ortalamaZarar: window.ortalamaZarar,
            beceriHasari: window.beceriHasari,
            ortalamaColor: window.ortalamaZararColor,
            beceriColor: window.beceriHasariColor
        };
        fetch("https://www.m2w2.com.tr/saveEfsunData.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(a)
        }).then((a => {
            a.ok ? console.log("Efsun verileri başarıyla kaydedildi.") : console.error("Efsun verileri kaydedilirken bir hata oluştu:", a.statusText)
        })).catch((a => {
            console.error("API isteği başarısız:", a)
        }))
    } else console.error("Global oyuncu kimliği bulunamadı!")
}, ChangeEfsun.prototype.hexToRgb = function(a) {
    var e = parseInt(a, 16);
    return new pc.Color((e >> 16 & 255) / 255, (e >> 8 & 255) / 255, (255 & e) / 255)
};
var ItemOzellikleri = pc.createScript("itemOzellikleriEnvanter");
ItemOzellikleri.attributes.add("ozellikEntity", {
    type: "entity"
}), ItemOzellikleri.prototype.initialize = function() {
    this.entity.element && (this.entity.element.on("mouseenter", this.onMouseEnter, this), this.entity.element.on("mouseleave", this.onMouseLeave, this))
}, ItemOzellikleri.prototype.onMouseEnter = function() {
    window.onSocket_6 && this.ozellikEntity && (this.ozellikEntity.enabled = !0)
}, ItemOzellikleri.prototype.onMouseLeave = function() {
    this.ozellikEntity && (this.ozellikEntity.enabled = !1)
};
var SetOrtalamaZarar = pc.createScript("setOrtalamaZarar");
SetOrtalamaZarar.prototype.initialize = function() {
    this.textElement = this.entity.element, this.loadOrtalamaData()
}, SetOrtalamaZarar.prototype.update = function(a) {
    this.textElement.text = window.ortalamaZarar, void 0 !== window.ortalamaZararColor ? this.textElement.color = this.hexToRgb(window.ortalamaZararColor) : this.textElement.color = this.hexToRgb("FFFFFF")
}, SetOrtalamaZarar.prototype.hexToRgb = function(a) {
    a.startsWith("#") || (a = "#" + a), a = a.replace(/^#/, "");
    var t = parseInt(a, 16),
        r = (t >> 16 & 255) / 255,
        o = (t >> 8 & 255) / 255,
        e = (255 & t) / 255;
    return new pc.Color(r, o, e)
}, SetOrtalamaZarar.prototype.loadOrtalamaData = function() {
    var a = this;
    fetch("https://www.m2w2.com.tr/loadOrtalama.php").then((a => {
        if (!a.ok) throw new Error("API çağrısı sırasında hata oluştu.");
        return a.json()
    })).then((t => {
        window.ortalamaZarar = t.ortalamaZarar, window.ortalamaZararColor = t.ortalamaColor, a.textElement.text = `Ortalama Zarar %${window.ortalamaZarar}`, a.textElement.color = a.hexToRgb(window.ortalamaZararColor)
    })).catch((a => {
        console.error(a)
    }))
};
var SetBeceriHasari = pc.createScript("setBeceriHasari");
SetBeceriHasari.prototype.initialize = function() {
    this.textElement = this.entity.element, this.loadBeceriData()
}, SetBeceriHasari.prototype.update = function(e) {
    this.textElement.text = window.beceriHasari, void 0 !== window.beceriHasariColor ? this.textElement.color = this.hexToRgb(window.beceriHasariColor) : this.textElement.color = this.hexToRgb("FFFFFF")
}, SetBeceriHasari.prototype.hexToRgb = function(e) {
    e.startsWith("#") || (e = "#" + e), e = e.replace(/^#/, "");
    var t = parseInt(e, 16),
        r = (t >> 16 & 255) / 255,
        i = (t >> 8 & 255) / 255,
        o = (255 & t) / 255;
    return new pc.Color(r, i, o)
}, SetBeceriHasari.prototype.loadBeceriData = function() {
    var e = this;
    fetch("https://www.m2w2.com.tr/loadBeceri.php").then((e => {
        if (!e.ok) throw new Error("API çağrısı sırasında hata oluştu.");
        return e.json()
    })).then((t => {
        window.beceriHasari = t.beceriHasari, window.beceriHasariColor = t.beceriColor, e.textElement.text = `Beceri Hasari %${window.beceriHasari}`, e.textElement.color = e.hexToRgb(window.beceriHasariColor)
    })).catch((e => {
        console.error(e)
    }))
};
var Metin = pc.createScript("metin");
Metin.attributes.add("textEntity", {
    type: "entity"
}), Metin.attributes.add("swordAsset", {
    type: "asset",
    assetType: "model"
}), Metin.prototype.swords = [], Metin.prototype.initialize = function() {
    this.currentPosition = this.entity.getPosition().clone(), this.app.on("repositionEvent", this.reposition, this), this.characterEntity = this.app.root.findByName("Warrior2"), this.inventoryManagerEntity = this.app.root.findByName("Envanter"), this.inventoryManagerEntity && (this.inventoryManager = this.inventoryManagerEntity.script.inventoryManager), this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this)
}, Metin.prototype.reposition = function() {
    this.entity.setPosition(this.currentPosition.x, .35, this.currentPosition.z);
    var t = new pc.Entity;
    t.addComponent("model", {
        asset: this.swordAsset
    });
    var i = 2 * (Math.random() - .5),
        e = 2 * (Math.random() - .5);
    t.setPosition(this.currentPosition.x + i, .1, this.currentPosition.z + e);
    var n = 360 * Math.random();
    t.setEulerAngles(90, n, 0), this.app.root.addChild(t), this.swords.push(t), this.startSwordTimer(t)
}, Metin.prototype.startSwordTimer = function(t) {
    t.timer = setTimeout((() => {
        t.destroy();
        var i = this.swords.indexOf(t); - 1 !== i && this.swords.splice(i, 1), console.log("10 saniye geçti, kılıç yok edildi.")
    }), 1e4)
}, Metin.prototype.onKeyDown = function(t) {
    if (t.key === pc.KEY_Z) {
        for (var i = null, e = 1 / 0, n = 0; n < this.swords.length; n++) {
            var o = this.swords[n];
            if (o) {
                var s = this.characterEntity.getPosition().distance(o.getPosition());
                s < e && s < 2 && (e = s, i = o)
            }
        }
        if (i && this.inventoryManager) {
            if (this.inventoryManager.isInventoryFull()) return void console.log("Envanter dolu, item alınamıyor!");
            var r = this.app.assets.find("dolunay.png").resource;
            r && this.inventoryManager.addItemToSlot(0, "dolunay.png", r, !1), i.timer && clearTimeout(i.timer), i.destroy();
            var a = this.swords.indexOf(i); - 1 !== a && this.swords.splice(a, 1)
        }
    }
};
var SelectTarget = pc.createScript("selectTargets");
SelectTarget.prototype.initialize = function() {
    this.rotationSpeed = 120, this.entity.element && "image" === this.entity.element.type ? this.entity.element.opacity = 0 : console.warn("Bu entity bir 'image' element içermiyor.")
}, SelectTarget.prototype.update = function(t) {
    this.entity.enabled && this.entity.rotate(0, this.rotationSpeed * t, 0)
};
var TakeDamage = pc.createScript("takeDamages");
TakeDamage.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamage.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.entity.element.opacity = 0, this.entity.element.outlineThickness = 0, console.log("TakeDamage script initialized, entity is initially invisible."), this.animating = !1, this.app.on("Player:MetinDamage", this.onFakeDamageEvent, this)
}, TakeDamage.prototype.onFakeDamageEvent = function(t) {
    const {
        damageAmount: e,
        guid: a
    } = t, i = Array.isArray(a) ? a : a.split(","), n = this.entity.parent;
    if (!n) return void console.error("Ana entity bulunamadı!");
    n._guid;
    let o = !1;
    i.forEach((t => {
        const a = this.app.root.findByGuid(t.trim());
        if (a) {
            n.getPosition().distance(a.getPosition()) <= 2 && (o = !0, this.displayDamageText(e))
        }
    }))
}, TakeDamage.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, TakeDamage.prototype.displayDamageText = function(t) {
    this.animating || (this.showDamageText(t), this.app.on("update", this.update, this))
}, TakeDamage.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        (new pc.Quat).copy(e).invert(), this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
}, TakeDamage.prototype.showDamageText = function(t) {
    this.entity.element.text = t, this.entity.element.opacity = 1, this.entity.element.outlineThickness = .6, this.entity.setLocalScale(1, 1, 1), this.entity.setLocalPosition(-55.324, 237.049, 0), this.animateText()
}, TakeDamage.prototype.animateText = function() {
    var t = this,
        e = Date.now(),
        a = 237.049,
        i = t.entity.element.outlineThickness || .95;
    t.app.on("update", (function animate(n) {
        var o = (Date.now() - e) / 1e3 / 1;
        if (o < 1) {
            var s = pc.math.lerp(1.8, 1.97, o);
            t.entity.setLocalScale(s, s, s);
            var p = pc.math.lerp(1, 1, o);
            t.entity.element.opacity = p;
            var m = pc.math.lerp(i, .8, o);
            t.entity.element.outlineThickness = m;
            var r = pc.math.lerp(-55.324, .6, o),
                l = a - -235.149 * Math.sin(o * Math.PI),
                c = t.entity.getLocalPosition();
            t.entity.setLocalPosition(r, l, c.z)
        } else t.entity.element.opacity = 0, t.entity.element.outlineThickness = 0, t.app.off("update", animate)
    }))
};
var ChangeCharacter = pc.createScript("changeCharacter");
ChangeCharacter.attributes.add("savasci", {
    type: "entity"
}), ChangeCharacter.attributes.add("sura", {
    type: "entity"
}), ChangeCharacter.prototype.initialize = function() {
    this.entity.script.network.enabled = !1, this.entity.script.attack.enabled = !1, this.keyboard = this.app.keyboard, this.isChanging = !1, this.socket = io.connect("https://46.20.15.223:3000");
    var a = this;
    this.socket.on("characterData", (function(i) {
        a.initializePlayers(i)
    }))
}, ChangeCharacter.prototype.initializePlayers = function(a) {
    window.secilenGlobalCharacter = a.globalCharacter, window.secilenGlobalPlayer = a.globalPlayer, window.secilenGlobalOther = a.globalOther, window.bizimGlobalOther = a.globalOther, window.secilenf3Basinca = a.globalf3Basinca, window.secilenF3Surekli = a.globalf3Surekli, window.secilenf2 = a.globalf2, window.secilenf1 = a.globalf1, window.secilendort = a.globaldort, window.secilenuc = a.globaluc, window.secilenitem = a.globalitem, window.secilenName = a.globalname, this.entity.script.network.enabled = !0, this.entity.script.attack.enabled = !0
}, ChangeCharacter.prototype.update = function(a) {
    null !== window.garakter && (1 == window.gar && (this.savasci.enabled = !0, this.sura.enabled = !1, null !== window.globalPlayerId && (window.globalCharacter = "savasciCharacter", window.globalPlayer = "Player", window.globalOther = "Other", window.f3basinca = "sav_f3Basinca", window.f3surekli = "sav_f3Surekli", window.f2 = "sav_f2Basinca", window.f1 = "sav_f1Basinca", window.dort = "sav_4Basinca", window.uc = "sav_3Basinca", window.item = "sav_dolu", window.name = window.globalName, this.socket.emit("karakterilize", {
        globalCharacter: window.globalCharacter,
        globalPlayer: window.globalPlayer,
        globalOther: window.globalOther,
        globalf3Basinca: window.f3basinca,
        globalf3Surekli: window.f3surekli,
        globalf2: window.f2,
        globalf1: window.f1,
        globaldort: window.dort,
        globaluc: window.uc,
        globalitem: window.item,
        globalname: window.name
    }))), 2 == window.gar && (this.savasci.enabled = !1, this.sura.enabled = !0, null !== window.globalPlayerId && (window.globalCharacter = "suraCharacter", window.globalPlayer = "Sura", window.globalOther = "suraOther", window.f3basinca = "sur_f3Basinca", window.f3surekli = "sur_f3Surekli", window.f2 = "sur_f2Basinca", window.f1 = "sur_f1Basinca", window.dort = "sur_4Basinca", window.uc = "sur_3Basinca", window.item = "sur_dolu", window.name = window.globalName, this.socket.emit("karakterilize", {
        globalCharacter: window.globalCharacter,
        globalPlayer: window.globalPlayer,
        globalOther: window.globalOther,
        globalf3Basinca: window.f3basinca,
        globalf3Surekli: window.f3surekli,
        globalf2: window.f2,
        globalf1: window.f1,
        globaldort: window.dort,
        globaluc: window.uc,
        globalitem: window.item,
        globalname: window.name
    }))), this.characterEntity = this.app.root.findByName(window.garakter))
};
var CharacterSelection = pc.createScript("characterSelection");
CharacterSelection.prototype.initialize = function() {
    window.garakter = null, this.entity.element.on("click", this.onButtonClick, this)
}, CharacterSelection.prototype.onButtonClick = function() {
    window.garakter = "savasciCharacter", window.gar = 1, window.f3basinca = "sav_f3Basinca", window.f3surekli = "sav_f3Surekli", window.f2 = "sav_f2Basinca", window.f1 = "sav_f1Basinca", window.dort = "sav_4Basinca", window.uc = "sav_3Basinca"
};
var CharacterSelection2 = pc.createScript("characterSelection2");
CharacterSelection2.prototype.initialize = function() {
    window.garakter = null, this.entity.element.on("click", this.onButtonClick, this)
}, CharacterSelection2.prototype.onButtonClick = function() {
    window.garakter = "suraCharacter", window.gar = 2, window.f3basinca = "sur_f3Basinca", window.f3surekli = "sur_f3Surekli", window.f2 = "sur_f2Basinca", window.f1 = "sur_f1Basinca", window.dort = "sur_4Basinca", window.uc = "sur_3Basinca", window.f1_anim = 1500
};
var SavSelect = pc.createScript("savSelect");
SavSelect.attributes.add("camera", {
    type: "entity"
}), SavSelect.attributes.add("screen", {
    type: "entity"
}), SavSelect.attributes.add("envanter", {
    type: "entity"
}), SavSelect.attributes.add("id", {
    type: "entity"
}), SavSelect.attributes.add("pass", {
    type: "entity"
}), SavSelect.attributes.add("savasci", {
    type: "entity"
}), SavSelect.prototype.initialize = function() {
    this.camera.script.camera.enabled = !1, this.envanter.script.inventoryManager.enabled = !1, this.targetPosition = this.entity.getLocalPosition().clone(), this.originalPosition = this.entity.getLocalPosition().clone(), this.moveSpeed = 5, this.keyboard = this.app.keyboard, this.canMoveRight = !1, this.canMoveLeft = !0
}, SavSelect.prototype.update = function(t) {
    this.canMoveRight && this.keyboard.wasPressed(pc.KEY_RIGHT) && (this.targetPosition.x -= 1.3, this.canMoveRight = !1, this.canMoveLeft = !0), this.canMoveLeft && this.keyboard.wasPressed(pc.KEY_LEFT) && (this.targetPosition.x += 1.3, this.canMoveLeft = !1, this.canMoveRight = !0);
    var e = this.entity.getLocalPosition();
    e.lerp(e, this.targetPosition, t * this.moveSpeed), this.entity.setLocalPosition(e), this.keyboard.wasPressed(pc.KEY_ENTER) && (this.canMoveRight ? (this.entity.anim.setBoolean("selected", !1), this.entity.anim.setBoolean("not_Selected", !0), window.oyuncu = "Sura", setTimeout((() => {
        this.screen.destroy(), this.camera.script.camera.enabled = !0, this.envanter.script.inventoryManager.enabled = !0, this.envanter.setLocalPosition(200.573, -158.616, 2.916), this.id.enabled = !0, this.pass.enabled = !0
    }), 3e3)) : (this.entity.anim.setBoolean("selected", !0), this.entity.anim.setBoolean("not_Selected", !1), window.garakter = "savasciCharacter", window.gar = 1, window.f3basinca = "sav_f3Basinca", window.f3surekli = "sav_f3Surekli", window.f2 = "sav_f2Basinca", window.f1 = "sav_f1Basinca", window.dort = "sav_4Basinca", window.uc = "sav_3Basinca", window.item = "sav_dolu", window.oyuncu = "Player", window.other = "Other", setTimeout((() => {
        this.screen.destroy(), this.app.fire("culling:enable"), this.camera.script.camera.enabled = !0, this.envanter.script.inventoryManager.enabled = !0, this.envanter.setLocalPosition(200.573, -158.616, 2.916), this.id.enabled = !0, this.pass.enabled = !0
    }), 3e3)))
};
var SurSelect = pc.createScript("surSelect");
SurSelect.attributes.add("camera", {
    type: "entity"
}), SurSelect.attributes.add("screen", {
    type: "entity"
}), SurSelect.prototype.initialize = function() {
    this.camera.script.camera.enabled = !1, this.targetPosition = this.entity.getLocalPosition().clone(), this.originalPosition = this.entity.getLocalPosition().clone(), this.moveSpeed = 5, this.keyboard = this.app.keyboard, this.canMoveRight = !1, this.canMoveLeft = !0
}, SurSelect.prototype.update = function(t) {
    this.canMoveRight && this.keyboard.wasPressed(pc.KEY_RIGHT) && (this.targetPosition.x -= 1.3, this.canMoveRight = !1, this.canMoveLeft = !0), this.canMoveLeft && this.keyboard.wasPressed(pc.KEY_LEFT) && (this.targetPosition.x += 1.3, this.canMoveLeft = !1, this.canMoveRight = !0);
    var e = this.entity.getLocalPosition();
    e.lerp(e, this.targetPosition, t * this.moveSpeed), this.entity.setLocalPosition(e), this.keyboard.wasPressed(pc.KEY_ENTER) && (this.canMoveLeft ? (this.entity.anim.setBoolean("selected", !1), this.entity.anim.setBoolean("not_Selected", !0), window.garakter = "savasciCharacter", window.gar = 1, window.f3basinca = "sav_f3Basinca", window.f3surekli = "sav_f3Surekli", window.f2 = "sav_f2Basinca", window.f1 = "sav_f1Basinca", window.dort = "sav_4Basinca", window.uc = "sav_3Basinca", window.item = "sav_dolu", window.oyuncu = "Player", window.f1_anim = 1500, setTimeout((() => {
        this.screen.destroy(), this.camera.script.camera.enabled = !0
    }), 3e3)) : (this.entity.anim.setBoolean("selected", !0), this.entity.anim.setBoolean("not_Selected", !1), window.garakter = "suraCharacter", window.gar = 2, window.f3basinca = "sur_f3Basinca", window.f3surekli = "sur_f3Surekli", window.f2 = "sur_f2Basinca", window.f1 = "sur_f1Basinca", window.dort = "sur_4Basinca", window.uc = "sur_3Basinca", window.item = "sur_dolu", window.f1_anim = 1500, window.other = "suraOther", window.oyuncu = "Sura", setTimeout((() => {
        this.screen.destroy(), this.camera.script.camera.enabled = !0
    }), 3e3)))
};
var TakeDamage = pc.createScript("playerName");
TakeDamage.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamage.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.textElement = this.entity.element, this.textElement ? (this.app.on("SetGlobalName", this.updateGlobalName, this), this.app.on("UpdateGlobalLevel", this.updateGlobalLevel, this)) : console.warn("Bu entity bir text element içermiyor!")
}, TakeDamage.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, TakeDamage.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
}, TakeDamage.prototype.updateGlobalName = function(t) {
    if (this.textElement) {
        var e = "Lv" + (window.globalLevelKac || 0) + " " + window.globalName;
        this.textElement.text = e
    }
}, TakeDamage.prototype.updateGlobalLevel = function(t) {
    if (this.textElement) {
        window.globalLevelKac = t;
        var e = this.textElement.text.split(" ").slice(1).join(" ");
        this.updateGlobalName(e)
    }
};
var Textler = pc.createScript("name");
Textler.prototype.initialize = function() {
    this.previousText = null, this.textChangeCount = 0, this.textElement = this.entity.element, this.textElement || console.error("Text element bulunamadı!")
}, Textler.prototype.update = function(t) {
    if (this.textElement) {
        var e = this.textElement.text;
        e !== this.previousText && (this.previousText = e, this.textChangeCount++, console.log("Metin değişti, sayac:", this.textChangeCount), 2 === this.textChangeCount && (window.globalName = e, console.log("GlobalName atandı:", window.globalName), this.entity.parent ? (console.log("Ana entity siliniyor:", this.entity.parent.name), this.entity.parent.destroy()) : console.warn("Ana entity bulunamadı.")))
    }
};
var TakeDamage = pc.createScript("otherName");
TakeDamage.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamage.attributes.add("targetGUID", {
    type: "string"
}), TakeDamage.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.textElement = this.entity.element, this.textElement ? (this.app.on("SetGlobalName", this.updateGlobalName, this), this.app.on("ShowTextElement", this.showTextElement, this)) : console.warn("Bu entity bir text element içermiyor!")
}, TakeDamage.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, TakeDamage.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
}, TakeDamage.prototype.updateGlobalName = function(t) {
    this.textElement && (this.textElement.text = t, window.globalName = t, console.log("GlobalName güncellendi:", window.globalName))
}, TakeDamage.prototype.showTextElement = function(t) {
    var e = this.entity.getParent()._guid;
    e && e === t ? (this.textElement.opacity = 1, console.log("Text elementi gösterildi.")) : console.log("GUID eşleşmedi, işlem yapılmadı.")
};
var TakeDamage = pc.createScript("playerLevel");
TakeDamage.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamage.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this)
}, TakeDamage.prototype.updateCameraRotation = function(a) {
    this.cameraRotation = a.clone()
}, TakeDamage.prototype.update = function() {
    var a = this.app.root.findByName("Camera");
    if (a) {
        var t = a.getRotation();
        this.entity.setRotation(t)
    } else console.error("Kamera bulunamadı.")
};
var TakeDamage = pc.createScript("playerLevelKac");
TakeDamage.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamage.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.textElement = this.entity.element, this.textElement ? this.app.on("SetGlobalName", this.updateGlobalName, this) : console.warn("Bu entity bir text element içermiyor!")
}, TakeDamage.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, TakeDamage.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        this.entity.setRotation(e), this.app.on("SetGlobalName", this.updateGlobalName, this)
    } else console.error("Kamera bulunamadı.")
}, TakeDamage.prototype.updateGlobalName = function(t) {
    this.textElement && (this.textElement.text = t, window.globalName = t, console.log("GlobalName güncellendi:", window.globalLevelKac))
};
var RakipHealthBar = pc.createScript("rakipHealthBar");
RakipHealthBar.prototype.initialize = function() {
    this.socket = io.connect("https://46.20.15.223:3000");
    var t = this;
    this.socket.on("rakipHealthBar", (function(e) {
        t.setRakipHealthBar(e)
    })), this.entity.element && "text" === this.entity.element.type || console.warn("Bu script bir Text Element üzerinde kullanılmalı!")
}, RakipHealthBar.prototype.setRakipHealthBar = function(t) {
    window.globalPlayerId == t.atck_id && (this.rakipId = t.id, this.rakipHP = t.hp)
}, RakipHealthBar.prototype.update = function(t) {
    this.entity.element && "text" === this.entity.element.type && (this.entity.element.text = String(this.rakipHP || 2e4))
};
var RakipProgressBar = pc.createScript("rakipProgressBar");
RakipProgressBar.attributes.add("progressImage", {
    type: "entity"
}), RakipProgressBar.attributes.add("progressImageMaxWidth", {
    type: "number"
}), RakipProgressBar.attributes.add("maxHP", {
    type: "number",
    default: 2e4
}), RakipProgressBar.prototype.initialize = function() {
    this.socket = io.connect("https://46.20.15.223:3000");
    var t = this;
    this.socket.on("rakipHealthBar", (function(e) {
        t.setRakipHealthBar(e)
    })), this.imageRect = this.progressImage.element.rect.clone(), this.setProgress(1), this.lastHp = this.rakipHP || this.maxHP, this.updateProgressBar()
}, RakipProgressBar.prototype.setRakipHealthBar = function(t) {
    window.globalPlayerId == t.atck_id && (this.rakipId = t.id, this.rakipHP = t.hp)
}, RakipProgressBar.prototype.update = function(t) {
    this.rakipHP !== this.lastHp && (this.lastHp = this.rakipHP || 2e4, this.updateProgressBar())
}, RakipProgressBar.prototype.updateProgressBar = function() {
    var t = pc.math.clamp(this.lastHp / this.maxHP, 0, 1);
    this.setProgress(t)
}, RakipProgressBar.prototype.setProgress = function(t) {
    t = pc.math.clamp(t, 0, 1), this.progress = t;
    var e = pc.math.lerp(0, this.progressImageMaxWidth, t);
    this.progressImage.element.width = e, this.imageRect.copy(this.progressImage.element.rect), this.imageRect.z = t, this.progressImage.element.rect = this.imageRect
};
var MetinHealthBar = pc.createScript("metinHealthBar");
MetinHealthBar.attributes.add("metin_healthbar", {
    type: "entity"
}), MetinHealthBar.prototype.initialize = function() {
    this.socket = io.connect("https://46.20.15.223:3000");
    var t = this;
    this.socket.on("metinHealthBar", (function(e) {
        t.setMetinHealthBar(e)
    })), this.entity.element && "text" === this.entity.element.type || console.warn("Bu script bir Text Element üzerinde kullanılmalı!")
}, MetinHealthBar.prototype.setMetinHealthBar = function(t) {
    window.globalPlayerId == t.atck_id && (this.rakipId = t.id, this.rakipHP = t.hp, this.rakipHP > 0 ? this.metin_healthbar.enabled = !0 : this.metin_healthbar.enabled = !1)
}, MetinHealthBar.prototype.update = function(t) {
    this.entity.element && "text" === this.entity.element.type && (this.entity.element.text = String(this.rakipHP || 5e3))
};
var MetinProgressBar = pc.createScript("metinProgressBar");
MetinProgressBar.attributes.add("progressImage", {
    type: "entity"
}), MetinProgressBar.attributes.add("progressImageMaxWidth", {
    type: "number"
}), MetinProgressBar.attributes.add("maxHP", {
    type: "number",
    default: 5e3
}), MetinProgressBar.prototype.initialize = function() {
    this.socket = io.connect("https://46.20.15.223:3000");
    var t = this;
    this.socket.on("metinHealthBar", (function(e) {
        t.setMetinHealthBar(e)
    })), this.imageRect = this.progressImage.element.rect.clone(), this.setProgress(1), this.lastHp = this.rakipHP || this.maxHP, this.updateProgressBar()
}, MetinProgressBar.prototype.setMetinHealthBar = function(t) {
    window.globalPlayerId == t.atck_id && (this.rakipId = t.id, this.rakipHP = t.hp)
}, MetinProgressBar.prototype.update = function(t) {
    this.rakipHP !== this.lastHp && (this.lastHp = this.rakipHP || 5e3, this.updateProgressBar())
}, MetinProgressBar.prototype.updateProgressBar = function() {
    var t = pc.math.clamp(this.lastHp / this.maxHP, 0, 1);
    this.setProgress(t)
}, MetinProgressBar.prototype.setProgress = function(t) {
    t = pc.math.clamp(t, 0, 1), this.progress = t;
    var e = pc.math.lerp(0, this.progressImageMaxWidth, t);
    this.progressImage.element.width = e, this.imageRect.copy(this.progressImage.element.rect), this.imageRect.z = t, this.progressImage.element.rect = this.imageRect
};
var RakipName = pc.createScript("rakipName");
RakipName.prototype.initialize = function() {
    this.socket = io.connect("https://46.20.15.223:3000");
    var t = this;
    this.socket.on("rakipHealthBar", (function(e) {
        t.setRakipHealthBar(e)
    })), this.entity.element && "text" === this.entity.element.type || console.warn("Bu script bir Text Element üzerinde kullanılmalı!")
}, RakipName.prototype.setRakipHealthBar = function(t) {
    window.globalPlayerId == t.atck_id && (this.rakipId = t.id)
}, RakipName.prototype.update = function(t) {
    this.entity.element && "text" === this.entity.element.type && (this.entity.element.text = String(this.rakipId || ""))
};
var MetinName = pc.createScript("metinName");
MetinName.attributes.add("cameraEntity", {
    type: "entity"
}), MetinName.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.textElement = this.entity.element, this.textElement || console.warn("Bu entity bir text element içermiyor!")
}, MetinName.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, MetinName.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
};
var OnlineSayisi = pc.createScript("onlineSayisi");
OnlineSayisi.prototype.initialize = function() {
    this.textElement = this.entity.element, this.socket = io.connect("https://46.20.15.223:3000");
    var i = this;
    this.socket.on("onlinePlayers", (function(t) {
        i.setOnlineSayisi(t)
    }))
}, OnlineSayisi.prototype.setOnlineSayisi = function(i) {
    let t = i.players || [],
        e = t.join("\n");
    this.textElement.text = e, console.log(e), console.log(t)
};
var ChangeChoiseTexture = pc.createScript("changeChoiseTexture");
ChangeChoiseTexture.attributes.add("newTexture", {
    type: "asset",
    assetType: "texture"
}), ChangeChoiseTexture.attributes.add("originalTexture", {
    type: "asset",
    assetType: "texture"
}), ChangeChoiseTexture.attributes.add("make_your_choise_1", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("make_your_choise_2", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("yari_insan", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("guc", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("zeka", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("kritik", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("sav_guc", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("sur_guc", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("sav_sav", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("sur_sav", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("ort_zarar", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("bec_hasari", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("patron_guc", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("seytan_guc", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("olumsuz_guc", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("simsek_sav", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("ruzgar_sav", {
    type: "entity"
}), ChangeChoiseTexture.attributes.add("metin_guc", {
    type: "entity"
}), ChangeChoiseTexture.prototype.initialize = function() {
    this.entity.element ? (this.entity.element.on("mouseenter", this.onMouseEnter, this), this.entity.element.on("mouseleave", this.onMouseLeave, this), this.entity.element.on("mousedown", this.onMouseDown, this), this.entity.element.textureAsset = this.originalTexture) : console.error("Bu entity'de 'element' bileşeni bulunmuyor.")
}, ChangeChoiseTexture.prototype.onMouseEnter = function() {
    this.newTexture && (this.entity.element.textureAsset = this.newTexture)
}, ChangeChoiseTexture.prototype.onMouseLeave = function() {
    this.originalTexture && (this.entity.element.textureAsset = this.originalTexture)
}, ChangeChoiseTexture.prototype.onMouseDown = function(e) {
    if (0 === e.button) {
        const e = this.entity.name;
        "make_your_choise_1" === e ? (this.make_your_choise_1.enabled = !1, this.make_your_choise_2.enabled = !1, window.lastChoiseDisabledTime = Date.now(), console.log("PvP seçimi yapıldı!"), this.updateTextBasedOnChoice(window.secilenChoisePvP)) : "make_your_choise_2" === e ? (this.make_your_choise_1.enabled = !1, this.make_your_choise_2.enabled = !1, window.lastChoiseDisabledTime = Date.now(), console.log("PvM seçimi yapıldı!"), this.updateTextBasedOnChoice(window.secilenChoisePvM)) : console.error("Bilinmeyen entity'ye tıklandı:", e)
    }
}, ChangeChoiseTexture.prototype.updateTextBasedOnChoice = function(e) {
    switch (e) {
        case 1:
            window.yari_insan_value += 10, this.yari_insan && (this.yari_insan.element.text = "Yarı İnsanlara Güç: %" + window.yari_insan_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 2:
            window.guc_value += 12, this.guc && (this.guc.element.text = "Güç: +" + window.guc_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 3:
            window.zeka_value += 12, this.zeka && (this.zeka.element.text = "Zeka: +" + window.zeka_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 4:
            window.kritik_value += 1, this.kritik && (this.kritik.element.text = "Kritik Vuruş Şansı: %" + window.kritik_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 5:
            window.sav_guc_value += 10, this.sav_guc && (this.sav_guc.element.text = "Savaşçıya Güç: %" + window.sav_guc_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 6:
            window.sur_guc_value += 10, this.sur_guc && (this.sur_guc.element.text = "Suraya Güç: %" + window.sur_guc_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 7:
            window.sav_sav_value += 20, this.sav_sav && (this.sav_sav.element.text = "Savaşçıya Sav: %" + window.sav_sav_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 8:
            window.sur_sav_value += 20, this.sur_sav && (this.sur_sav.element.text = "Suraya Sav: %" + window.sur_sav_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 9:
            window.ort_zarar_value += 10, this.ort_zarar && (this.ort_zarar.element.text = "Ortalama Zarar: %" + window.ort_zarar_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 10:
            window.bec_hasari_value += 10, this.bec_hasari && (this.bec_hasari.element.text = "Beceri Hasarı: %" + window.bec_hasari_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 11:
            window.patron_guc_value += 10, this.patron_guc && (this.patron_guc.element.text = "Patronlara Güç: %" + window.patron_guc_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 12:
            window.seytan_guc_value += 10, this.seytan_guc && (this.seytan_guc.element.text = "Şeytanlara Güç: %" + window.seytan_guc_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 13:
            window.olumsuz_guc_value += 10, this.olumsuz_guc && (this.olumsuz_guc.element.text = "Ölümsüzlere Güç: %" + window.olumsuz_guc_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 14:
            window.simsek_sav_value += 1, this.simsek_sav && (this.simsek_sav.element.text = "Şimşeğe Sav: %" + window.simsek_sav_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 15:
            window.ruzgar_sav_value += 1, this.ruzgar_sav && (this.ruzgar_sav.element.text = "Rüzgara Sav: %" + window.ruzgar_sav_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        case 16:
            window.metin_guc_value += 10, this.metin_guc && (this.metin_guc.element.text = "Metin Taşına Güç: %" + window.metin_guc_value), this.app.fire("choise:pvpSetRandom"), this.app.fire("choise:pvmSetRandom");
            break;
        default:
            console.error("Geçersiz seçim.")
    }
};
var ChoiseSistemiPvp = pc.createScript("choiseSistemiPvp");
ChoiseSistemiPvp.prototype.choices = [{
    id: 1,
    text: "Yarı İnsanlara Karşı Güçlü +%10"
}, {
    id: 2,
    text: "Güç +12"
}, {
    id: 3,
    text: "Zeka +12"
}, {
    id: 4,
    text: "Kritik Vuruş Şansı +%1"
}, {
    id: 5,
    text: "Savaşçılara Karşı Güçlü +%10"
}, {
    id: 6,
    text: "Suralara Karşı Güçlü +%10"
}, {
    id: 7,
    text: "Savaşçılara Karşı Savunma +%20"
}, {
    id: 8,
    text: "Suralara Karşı Savunma +%20"
}, {
    id: 9,
    text: "Ortalama Zarar +%10"
}, {
    id: 10,
    text: "Beceri Hasarı +%10"
}], ChoiseSistemiPvp.prototype.initialize = function() {
    var e = this;
    this.setRandomChoice(), this.app.on("choise:pvpSetRandom", (function() {
        e.setRandomChoice()
    }))
}, ChoiseSistemiPvp.prototype.setRandomChoice = function() {
    var e = Math.floor(Math.random() * this.choices.length),
        t = this.choices[e];
    this.updateTextElement(t), console.log("Yeni Rastgele Seçim: " + t.text + ", ID: " + t.id)
}, ChoiseSistemiPvp.prototype.updateTextElement = function(e) {
    var t = this.entity.element;
    t ? (t.text = e.text, window.secilenChoisePvP = e.id) : console.error("Text Element bulunamadı. Lütfen bu script'in eklendiği entity'nin Text Element içermesini sağlayın.")
};
var ChoiseSistemiPvm = pc.createScript("choiseSistemiPvm");
ChoiseSistemiPvm.prototype.choices = [{
    id: 11,
    text: "Patronlara Karşı Güçlü +%10"
}, {
    id: 2,
    text: "Güç +12"
}, {
    id: 3,
    text: "Zeka +12"
}, {
    id: 4,
    text: "Kritik Vuruş Şansı +%1"
}, {
    id: 12,
    text: "Şeytanlara Karşı Güçlü +%10"
}, {
    id: 13,
    text: "Ölümsüzlere Karşı Güçlü +%10"
}, {
    id: 14,
    text: "Şimşeğe Karşı Dayanıklılık +%1"
}, {
    id: 15,
    text: "Rüzgara Karşı Dayanıklılık +%1"
}, {
    id: 16,
    text: "Metin Taşlarına Karşı Güçlü +%10"
}, {
    id: 9,
    text: "Ortalama Zarar +%10"
}], ChoiseSistemiPvm.prototype.initialize = function() {
    var e = this;
    this.setRandomChoice(), this.app.on("choise:pvmSetRandom", (function() {
        e.setRandomChoice()
    }))
}, ChoiseSistemiPvm.prototype.setRandomChoice = function() {
    var e = Math.floor(Math.random() * this.choices.length),
        t = this.choices[e];
    this.updateTextElement(t), console.log("Yeni Rastgele Seçim: " + t.text + ", ID: " + t.id)
}, ChoiseSistemiPvm.prototype.updateTextElement = function(e) {
    var t = this.entity.element;
    t ? (t.text = e.text, window.secilenChoisePvM = e.id) : console.error("Text Element bulunamadı. Lütfen bu script'in eklendiği entity'nin Text Element içermesini sağlayın.")
};
var BonusTablo = pc.createScript("bonusTablo");
BonusTablo.attributes.add("tablo", {
    type: "entity"
}), BonusTablo.prototype.initialize = function() {
    this.tablo.enabled = !1
}, BonusTablo.prototype.update = function(o) {
    this.app.keyboard.wasPressed(pc.KEY_C) && (this.tablo.enabled = !this.tablo.enabled, console.log("Tablo enabled durumu: " + this.tablo.enabled))
};
var BossHealthBar = pc.createScript("bossHealthBar");
BossHealthBar.attributes.add("boss_healthbar", {
    type: "entity"
}), BossHealthBar.prototype.initialize = function() {
    this.socket = io.connect("https://46.20.15.223:3000");
    var t = this;
    this.socket.on("bossHealthBar", (function(e) {
        t.setBossHealthBar(e)
    })), this.entity.element && "text" === this.entity.element.type || console.warn("Bu script bir Text Element üzerinde kullanılmalı!")
}, BossHealthBar.prototype.setBossHealthBar = function(t) {
    window.globalPlayerId == t.atck_id && (this.rakipId = t.id, this.rakipHP = t.hp, this.rakipHP > 0 ? this.boss_healthbar.enabled = !0 : this.boss_healthbar.enabled = !1)
}, BossHealthBar.prototype.update = function(t) {
    this.entity.element && "text" === this.entity.element.type && (this.entity.element.text = String(this.rakipHP || 5e4))
};
var BossProgressBar = pc.createScript("bossProgressBar");
BossProgressBar.attributes.add("progressImage", {
    type: "entity"
}), BossProgressBar.attributes.add("progressImageMaxWidth", {
    type: "number"
}), BossProgressBar.attributes.add("maxHP", {
    type: "number",
    default: 5e4
}), BossProgressBar.prototype.initialize = function() {
    this.socket = io.connect("https://46.20.15.223:3000");
    var s = this;
    this.socket.on("bossHealthBar", (function(t) {
        s.setBossHealthBar(t)
    })), this.imageRect = this.progressImage.element.rect.clone(), this.setProgress(1), this.lastHp = this.rakipHP || this.maxHP, this.updateProgressBar()
}, BossProgressBar.prototype.setBossHealthBar = function(s) {
    window.globalPlayerId == s.atck_id && (this.rakipId = s.id, this.rakipHP = s.hp)
}, BossProgressBar.prototype.update = function(s) {
    this.rakipHP !== this.lastHp && (this.lastHp = this.rakipHP || 5e4, this.updateProgressBar())
}, BossProgressBar.prototype.updateProgressBar = function() {
    var s = pc.math.clamp(this.lastHp / this.maxHP, 0, 1);
    this.setProgress(s)
}, BossProgressBar.prototype.setProgress = function(s) {
    s = pc.math.clamp(s, 0, 1), this.progress = s;
    var t = pc.math.lerp(0, this.progressImageMaxWidth, s);
    this.progressImage.element.width = t, this.imageRect.copy(this.progressImage.element.rect), this.imageRect.z = s, this.progressImage.element.rect = this.imageRect
};
var BossName = pc.createScript("bossName");
BossName.attributes.add("cameraEntity", {
    type: "entity"
}), BossName.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.textElement = this.entity.element, this.textElement || console.warn("Bu entity bir text element içermiyor!")
}, BossName.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, BossName.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
};
var TakeDamageBoss = pc.createScript("takeDamageBoss");
TakeDamageBoss.attributes.add("cameraEntity", {
    type: "entity"
}), TakeDamageBoss.prototype.initialize = function() {
    this.app.on("Camera:UpdateRotation", this.updateCameraRotation, this), this.entity.element.opacity = 0, this.entity.element.outlineThickness = 0, console.log("TakeDamage script initialized, entity is initially invisible."), this.animating = !1, this.app.on("Player:OtherDamage", this.onFakeDamageEvent, this)
}, TakeDamageBoss.prototype.onFakeDamageEvent = function(t) {
    const {
        damageAmount: e,
        guid: a
    } = t, i = Array.isArray(a) ? a : a.split(","), n = this.entity.parent;
    if (!n) return void console.error("Ana entity bulunamadı!");
    n._guid;
    let o = !1;
    i.forEach((t => {
        const a = this.app.root.findByGuid(t.trim());
        if (a) {
            n.getPosition().distance(a.getPosition()) <= 2 && (o = !0, this.displayDamageText(e))
        }
    }))
}, TakeDamageBoss.prototype.updateCameraRotation = function(t) {
    this.cameraRotation = t.clone()
}, TakeDamageBoss.prototype.displayDamageText = function(t) {
    this.animating || (this.showDamageText(t), this.app.on("update", this.update, this))
}, TakeDamageBoss.prototype.update = function() {
    var t = this.app.root.findByName("Camera");
    if (t) {
        var e = t.getRotation();
        (new pc.Quat).copy(e).invert(), this.entity.setRotation(e)
    } else console.error("Kamera bulunamadı.")
}, TakeDamageBoss.prototype.showDamageText = function(t) {
    this.entity.element.text = t, this.entity.element.opacity = 1, this.entity.element.outlineThickness = .6, this.entity.setLocalScale(.01, .01, .01), this.entity.setLocalPosition(0, 6, 0), this.animateText()
}, TakeDamageBoss.prototype.animateText = function() {
    var t = this,
        e = Date.now(),
        a = t.entity.element.outlineThickness || .6;
    t.app.on("update", (function animate(i) {
        var n = (Date.now() - e) / 1e3 / .4;
        if (n < 1) {
            var o = pc.math.lerp(.015, .02, n);
            t.entity.setLocalScale(o, o, o);
            var s = pc.math.lerp(1, .9, n);
            t.entity.element.opacity = s;
            var p = pc.math.lerp(a, .5, n);
            t.entity.element.outlineThickness = p;
            var m = pc.math.lerp(2, 2.7, n),
                r = 0 + .5 * Math.sin(n * Math.PI),
                l = t.entity.getLocalPosition();
            t.entity.setLocalPosition(l.x, m, r)
        } else t.entity.element.opacity = 0, t.entity.element.outlineThickness = 0, t.app.off("update", animate)
    }))
};
var Misyon1 = pc.createScript("misyon1");
Misyon1.prototype.initialize = function() {
    this.app.on("updateText", ((t, e, i) => {
        this.entity && this.entity.element ? this.entity.element.text = `Oyuncu "${t}" ${e} damage barajını aştı! +${i} str kazandı..` : console.error("Bu entity bir text elementine sahip değil.")
    }))
}, Misyon1.prototype.update = function(t) {};
var AutoAttack = pc.createScript("autoAttack");
AutoAttack.attributes.add("characterEntity", {
    type: "entity"
}), AutoAttack.attributes.add("cameraEntity", {
    type: "entity"
}), AutoAttack.attributes.add("playerSpeed", {
    type: "number",
    default: 5
}), AutoAttack.attributes.add("attackDistance", {
    type: "number",
    default: 1.5
}), AutoAttack.prototype.initialize = function() {
    this.target = null, this.force = new pc.Vec3, this.characterAnim = this.characterEntity?.anim, this.characterAnim || console.warn("Character anim component yok."), this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this)
}, AutoAttack.prototype.onMouseDown = function(t) {
    if (0 !== t.button) return;
    const a = this.cameraEntity.camera.screenToWorld(t.x, t.y, this.cameraEntity.camera.nearClip),
        e = this.cameraEntity.camera.screenToWorld(t.x, t.y, this.cameraEntity.camera.farClip),
        i = this.app.systems.rigidbody.raycastFirst(a, e);
    i && i.entity && i.entity.tags.has("metin") ? this.target = i.entity : this.target = null
}, AutoAttack.prototype.update = function(t) {
    if (!this.target || !this.characterEntity || !this.characterAnim) return;
    if (this.characterAnim.getBoolean("isDead")) return;
    const a = this.characterEntity.getPosition(),
        e = this.target.getPosition();
    if (a.distance(e) > this.attackDistance) {
        const i = e.clone().sub(a);
        if (i.y = 0, i.normalize(), this.characterEntity.rigidbody) this.force.copy(i).scale(this.playerSpeed), this.characterEntity.rigidbody.linearVelocity = this.force;
        else {
            const e = i.clone().scale(this.playerSpeed * t);
            this.characterEntity.setPosition(a.add(e))
        }
        const c = a.clone().add(i);
        this.characterEntity.lookAt(c), this.characterAnim.setBoolean("isSpace", !1), this.characterAnim.setBoolean("isYumruk", !1)
    } else {
        this.characterEntity.rigidbody && (this.characterEntity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0)), this.characterAnim.setBoolean("isSpace", !0);
        const t = this.characterEntity.script?.attack;
        t && "function" == typeof t.startAttack && t.startAttack(), this.target = null
    }
};
var SlotHandler = function(t) {
    this.manager = t, this.slots = t.slots, this.sockets = t.socketHandler.sockets, this.selectedSlot = null, this.originalTexture = null
};
SlotHandler.prototype.bindSlotEvents = function() {
    this.slots.forEach(((t, e) => {
        t.element.on("click", (() => this.onSlotClick(e)), this)
    }))
}, SlotHandler.prototype.onSlotClick = function(t) {
    var e = this.slots[t],
        l = this.manager.socketHandler.sockets;
    null !== this.selectedSlot ? this.selectedSlot === e ? (this.resetSlotTexture(this.selectedSlot), this.selectedSlot = null, console.log("Seçim kaldırıldı.")) : l[t] ? (this.resetSlotTexture(this.selectedSlot), this.selectedSlot = null, console.log("Slot dolu, işlem yapılmadı.")) : (this.resetSlotTexture(this.selectedSlot), this.manager.socketHandler.transferItemToSlot(this.selectedSlot, e, t), this.selectedSlot = null) : l[t] ? (this.selectedSlot = e, this.highlightSlot(e, t), console.log("Slot seçildi: Slot " + (t + 1))) : console.log("Boş slot seçilemez.")
}, SlotHandler.prototype.highlightSlot = function(t, e) {
    const l = this.manager.socketHandler.sockets[e];
    if (l) {
        this.originalTexture = l.element.texture;
        const t = this.manager.app.assets.find("select_dolunay.png")?.resource;
        t ? l.element.texture = t : console.error("Seçim texture'ı bulunamadı.")
    }
}, SlotHandler.prototype.resetSlotTexture = function(t) {
    const e = this.slots.indexOf(t),
        l = this.manager.socketHandler.sockets[e];
    l && this.originalTexture && (l.element.texture = this.originalTexture, this.originalTexture = null)
};
var InventoryManager = pc.createScript("inventoryManager");
InventoryManager.attributes.add("slot_1", {
    type: "entity"
}), InventoryManager.attributes.add("slot_2", {
    type: "entity"
}), InventoryManager.attributes.add("slot_3", {
    type: "entity"
}), InventoryManager.attributes.add("slot_4", {
    type: "entity"
}), InventoryManager.attributes.add("slot_5", {
    type: "entity"
}), InventoryManager.attributes.add("ekipman_slot", {
    type: "entity"
}), InventoryManager.prototype.initialize = function() {
    this.slots = [this.slot_1, this.slot_2, this.slot_3, this.slot_4, this.slot_5, this.ekipman_slot], this.characterEntity = this.app.root.findByName(window.garakter), this.ekipman_item = this.app.root.findByName(window.item), this.keyboard = this.app.keyboard, this.isChanging = !1, this.utils = new InventoryUtils(this), this.socketHandler = new SocketHandler(this), this.slotHandler = new SlotHandler(this), this.inputHandler = new InventoryInput(this), this.api = new InventoryAPI(this), this.utils.updateSocketStates(), this.inputHandler.bindKeyboardEvents(), this.slotHandler.bindSlotEvents(), this.api.loadInitialData()
}, InventoryManager.prototype.addItemToSlot = function(t, e, s) {
    if (!this.socketHandler.sockets[t]) {
        const n = this.socketHandler._createSocketEntity(t, s);
        this.slots[t].addChild(n), this.socketHandler.sockets[t] = n, this.utils.saveItemToAPI(t, e), this.utils.updateSocketStates()
    }
}, InventoryManager.prototype.deleteItemFromSlot = function() {
    for (let t = this.socketHandler.sockets.length - 1; t >= 0; t--) {
        const e = this.socketHandler.sockets[t];
        if (e) {
            this.utils.deleteItemFromAPI(t, e.element.texture.name), e.destroy(), this.socketHandler.sockets[t] = null, this.utils.updateSocketStates();
            break
        }
    }
};
var InventoryUtils = function(e) {
    this.manager = e
};
InventoryUtils.prototype.updateSocketStates = function() {
    for (let e = 0; e < this.manager.socketHandler.sockets.length; e++) {
        const t = !!this.manager.socketHandler.sockets[e];
        window[`onSocket_${e+1}`] = t
    }
    this.checkEquipmentSlot()
}, InventoryUtils.prototype.checkEquipmentSlot = function() {
    const e = this.manager.slots.indexOf(this.manager.ekipman_slot),
        t = !!this.manager.socketHandler.sockets[e];
    this.manager.ekipman_item && (this.manager.ekipman_item.enabled = t), this.manager.characterEntity && this.manager.characterEntity.anim ? this.manager.characterEntity.anim.setBoolean("isStunning", !t) : console.error("characterEntity için anim bileşeni bulunamadı.")
}, InventoryUtils.prototype.saveItemToAPI = function(e, t) {
    var n = new FormData;
    n.append("user_id", window.globalPlayerId), n.append("slot_id", e + 1), n.append("item_name", t), n.append("ortalamaZarar", window.ortalamaZarar), n.append("beceriHasari", window.beceriHasari), n.append("ortalamaColor", window.ortalamaZararColor), n.append("beceriColor", window.beceriHasariColor), fetch("https://www.m2w2.com.tr/inventorySave.php", {
        method: "POST",
        body: n
    }).then((e => e.text())).then((e => console.log("Item kaydedildi:", e))).catch((e => console.error("API save error:", e)))
}, InventoryUtils.prototype.saveItemPositionToAPI = function(e, t) {
    var n = new FormData;
    n.append("user_id", window.globalPlayerId), n.append("slot_id", e + 1), n.append("item_name", t), fetch("https://www.m2w2.com.tr/inventoryUpdatePosition.php", {
        method: "POST",
        body: n
    }).then((e => e.text())).then((e => console.log("Item konumu güncellendi:", e))).catch((e => console.error("API position update error:", e)))
}, InventoryUtils.prototype.deleteItemFromAPI = function(e, t) {
    var n = new FormData;
    n.append("user_id", window.globalPlayerId), n.append("slot_id", e + 1), n.append("item_name", t), fetch("https://www.m2w2.com.tr/inventoryDelete.php", {
        method: "POST",
        body: n
    }).then((e => e.text())).then((e => console.log("Item silindi:", e))).catch((e => console.error("API delete error:", e)))
};
var SocketHandler = function(t) {
    this.manager = t, this.slots = t.slots, this.sockets = new Array(this.slots.length).fill(null)
};
SocketHandler.prototype.loadItemToSlotById = function(t, e, o) {
    const s = t - 1;
    if (s >= 0 && s < this.slots.length && !this.sockets[s]) {
        const e = this._createSocketEntity(s, o);
        this.slots[s].addChild(e), this.sockets[s] = e, console.log(`Item yüklendi: Slot ${t}`)
    } else console.log(`Slot ${t} dolu ya da geçersiz.`);
    this.manager.utils.updateSocketStates()
}, SocketHandler.prototype.transferItemToSlot = function(t, e, o) {
    const s = this.slots.indexOf(t),
        n = this.sockets[s]?.element.texture;
    if (!n) return;
    this.sockets[s].destroy(), this.sockets[s] = null;
    const l = this._createSocketEntity(o, n);
    e.addChild(l), this.sockets[o] = l, this.manager.utils.saveItemPositionToAPI(o, n.name), this.manager.utils.updateSocketStates(), console.log(`Item taşındı: Slot ${s+1} → Slot ${o+1}`)
}, SocketHandler.prototype.clearSockets = function() {
    this.sockets.forEach((t => t?.destroy())), this.sockets = new Array(this.slots.length).fill(null), this.manager.utils.updateSocketStates()
}, SocketHandler.prototype.isInventoryFull = function() {
    return this.sockets.every((t => null !== t))
}, SocketHandler.prototype._createSocketEntity = function(t, e) {
    const o = new pc.Entity(`socket_${t+1}`);
    return o.addComponent("element", {
        type: "image",
        texture: e,
        anchor: new pc.Vec4(.5, 0, .5, 0),
        pivot: new pc.Vec2(.5, .5),
        width: 28,
        height: 60
    }), o
};
var InventoryInput = function(n) {
    this.manager = n
};
InventoryInput.prototype.bindKeyboardEvents = function() {
    window.addEventListener("keydown", this.onKeyDown.bind(this))
}, InventoryInput.prototype.onKeyDown = function(n) {
    const e = this.manager;
    if ("1" === n.key) {
        const n = e.app.assets.find("dolunay.png")?.resource;
        n && e.addItemToSlot(0, "dolunay.png", n)
    } else "2" === n.key ? e.deleteItemFromSlot() : "ı" === n.key && (e.entity.enabled = !e.entity.enabled, e.entity.enabled && e.entity.setLocalPosition(200.573, -158.616, 2.916))
};
var InventoryAPI = function(o) {
    this.manager = o
};
InventoryAPI.prototype.loadInitialData = function() {
    this.waitForGlobalPlayerId().then((() => {
        this.loadInventory(), this.loadEfsunData()
    }))
}, InventoryAPI.prototype.waitForGlobalPlayerId = function() {
    return new Promise((o => {
        const a = setInterval((() => {
            window.globalPlayerId && (clearInterval(a), o())
        }), 100)
    }))
}, InventoryAPI.prototype.loadInventory = function() {
    if (!window.globalPlayerId) return;
    const o = encodeURIComponent(`"${window.globalPlayerId}"`);
    fetch(`https://www.m2w2.com.tr/inventory.php?user_id=${o}`).then((o => o.json())).then((o => {
        this.manager.socketHandler.clearSockets(), o.forEach((o => {
            const a = this.manager.app.assets.find(o.item_name)?.resource;
            a && o.slot_id > 0 && this.manager.socketHandler.loadItemToSlotById(o.slot_id, o.item_name, a)
        }))
    })).catch((o => console.error("Inventory API error:", o)))
}, InventoryAPI.prototype.loadEfsunData = function() {
    if (!window.globalPlayerId) return;
    const o = encodeURIComponent(`"${window.globalPlayerId}"`);
    fetch(`https://www.m2w2.com.tr/loadEfsunData.php?user_id=${o}`).then((o => o.json())).then((o => {
        o && (window.ortalamaZarar = o.ortalamaZarar, window.ortalamaZararColor = o.ortalamaColor, window.beceriHasari = o.beceriHasari, window.beceriHasariColor = o.beceriColor)
    })).catch((o => console.error("Efsun data error:", o)))
};
var MetinBot = pc.createScript("metinBot");
MetinBot.prototype.initialize = function() {
    this.isComboActive = !1, this.isActive = !1, this.currentMetin = null, this.ownerMovement = this.entity.script.movement, this.ownerNetwork = this.entity.script.network, this.onMetinDeadBind = this.onMetinDead.bind(this), this.app.keyboard.on(pc.EVENT_KEYDOWN, (function(t) {
        t.key === pc.KEY_O && (this.isActive = !this.isActive, this.isActive ? (console.log("[MetinBot] O tuşuna basıldı, bot başlıyor!"), this.start()) : (console.log("[MetinBot] O tuşuna basıldı, bot durdu."), this.stop())), t.key === pc.KEY_P && (this.isComboActive = !this.isComboActive, this.isComboActive ? (console.log("[MetinBot] P: attack:startComboLoop fired"), this.app.fire("attack:startComboLoop")) : (console.log("[MetinBot] P: attack:stopComboLoop fired"), this.app.fire("attack:stopComboLoop")))
    }), this), console.log("[MetinBot] initialize oldu, script yüklendi.")
}, MetinBot.prototype.findClosestAliveMetin = function() {
    var t = this.entity.getPosition(),
        i = null,
        o = Number.POSITIVE_INFINITY,
        e = this.ownerNetwork.metins;
    for (var n in e) {
        var s = e[n];
        if (s && s.entity && s.entity.characterEntity)
            if (!(s.entity.characterEntity.anim && s.entity.characterEntity.anim.getBoolean("Dead"))) {
                var a = t.distance(s.entity.getPosition());
                a < o && (o = a, i = s.entity)
            }
    }
    return i ? console.log(`[MetinBot] En yakın canlı metin bulundu. Mesafe: ${o.toFixed(2)}`) : console.log("[MetinBot] Canlı metin bulunamadı!"), i
}, MetinBot.prototype.start = function() {
    console.log("[MetinBot] start fonksiyonu çağrıldı."), this.app.on("deadMetin", this.onMetinDeadBind), this.goToNextMetin()
}, MetinBot.prototype.stop = function() {
    console.log("[MetinBot] stop fonksiyonu çağrıldı. Bot kapatıldı."), this.isActive = !1, this.currentMetin = null, this.ownerMovement.targetEntity = null, this.ownerMovement.isBotting = !1, this.app.fire("attack:stopComboLoop"), this.app.off("deadMetin", this.onMetinDeadBind)
}, MetinBot.prototype.goToNextMetin = function() {
    if (this.isActive) {
        var t = this.findClosestAliveMetin();
        t ? (console.log("[MetinBot] Yeni hedef metin bulundu. Yürümeye başlıyor."), this.currentMetin = t, this.ownerMovement.targetEntity = t, this.ownerMovement.hasStartedCombo = !1, this.ownerMovement.isBotting = !0) : (console.log("[MetinBot] Hiç canlı metin yok, bekleme modunda. 1sn sonra tekrar kontrol edilecek."), setTimeout((() => {
            this.isActive && this.goToNextMetin()
        }), 1e3))
    } else console.log("[MetinBot] goToNextMetin çağrıldı ama bot aktif değil, çıkılıyor.")
}, MetinBot.prototype.onMetinDead = function(t) {
    console.log(`[MetinBot] Metin öldü (ID: ${t&&t.id?t.id:"bilinmiyor"}), yeni hedef aranacak...`), this.isActive && setTimeout((() => {
        this.goToNextMetin(), this.app.fire("attack:stopComboLoop")
    }), 50)
};
var AutoBatchStones = pc.createScript("autoBatchStones");
AutoBatchStones.attributes.add("batchGroupName", {
    type: "string",
    default: "StonesGroup"
}), AutoBatchStones.attributes.add("gridCols", {
    type: "number",
    default: 6
}), AutoBatchStones.attributes.add("spacing", {
    type: "number",
    default: 5
}), AutoBatchStones.prototype.batchAll = function() {
    var t = this.app,
        e = this.batchGroupName,
        a = t.root,
        o = t.batcher,
        n = [];
    a.find((function(t) {
        return "Stone2" === t.name && n.push(t), !1
    }));
    var r, u = this.gridCols,
        i = this.spacing,
        c = n.length,
        h = (u - 1) * i,
        s = (Math.ceil(c / u) - 1) * i,
        d = new pc.Vec3(h / 2, 20, s / 2),
        p = o.getGroupByName(e);
    r = p ? p.id : o.addGroup(e, !1, 500, d);
    var l = [];
    n.forEach((function(t) {
        t.children.forEach((function(t) {
            t.model && t.model.type ? (t.model.batchGroupId = r, t.model.isStatic = !0, l.push(t)) : t.render && t.render.type && (t.render.batchGroupId = r, t.render.isStatic = !0, l.push(t))
        }))
    })), l.length > 0 ? (o.generate([r]), console.log('Batch group "' + e + '" oluşturuldu, modele sahip child sayısı:', l.length, "| BatchLimit:", 500, "| AABB:", d)) : console.warn("Hiç uygun model/render child bulunamadı.")
}, AutoBatchStones.prototype.initialize = function() {
    this.app.on("stone2:spawned", this.batchAll, this)
};
var FpsCounter = pc.createScript("fpsCounter");
FpsCounter.prototype.initialize = function() {
    this.lastUpdate = Date.now(), this.frameCount = 0, this.fps = 0;
    var t = document.createElement("div");
    t.style.position = "absolute", t.style.top = "10px", t.style.left = "10px", t.style.color = "white", t.style.fontSize = "20px", t.style.background = "rgba(0,0,0,0.5)", t.style.padding = "4px 8px", t.style.zIndex = 9999, t.id = "fpsCounter", document.body.appendChild(t), this.div = t
}, FpsCounter.prototype.update = function(t) {
    this.frameCount++;
    var e = Date.now();
    e - this.lastUpdate > 500 && (this.fps = Math.round(1e3 * this.frameCount / (e - this.lastUpdate)), this.div.innerText = "FPS: " + this.fps, this.lastUpdate = e, this.frameCount = 0)
};
var Stone2Spawner = pc.createScript("stone2Spawner");
Stone2Spawner.attributes.add("stone2Prefab", {
    type: "entity"
}), Stone2Spawner.attributes.add("count", {
    type: "number",
    default: 30
}), Stone2Spawner.attributes.add("gridCols", {
    type: "number",
    default: 6
}), Stone2Spawner.attributes.add("spacing", {
    type: "number",
    default: 5
}), Stone2Spawner.prototype.initialize = function() {
    if (this.stone2Prefab) {
        for (var t = this.entity, e = this.gridCols, n = Math.ceil(this.count / e), a = this.spacing, o = -((e - 1) * a) / 2, r = -((n - 1) * a) / 2, i = 0; i < this.count; i++) {
            var s = this.stone2Prefab.clone();
            s.enabled = !0;
            var p = Math.floor(i / e),
                d = i % e;
            s.setPosition(d * a + o, 0, p * a + r), s.name = "Stone2", t.addChild(s)
        }
        this.app.fire("stone2:spawned"), console.log(this.count + " Stone2 entity oluşturuldu!")
    } else console.error("Stone2 prefab atanmamış!")
};
var SpectralReaper = pc.createScript("spectralReaper");
window.showPetSkillPopup = function(t, e, i) {
    let a = document.getElementById("petSkillPopup");
    a && a.parentNode.removeChild(a);
    let s = document.createElement("div");
    if (s.id = "petSkillPopup", s.style.position = "absolute", s.style.top = "14%", s.style.left = "50%", s.style.transform = "translate(-50%, 0)", s.style.minWidth = "320px", s.style.maxWidth = "480px", s.style.display = "flex", s.style.alignItems = "center", s.style.gap = "20px", s.style.justifyContent = "center", s.style.background = "linear-gradient(90deg, #4c3b6d 0%, #192d56 100%)", s.style.boxShadow = "0 6px 30px 0 rgba(20,0,60,0.35), 0 1.5px 6px 0 rgba(0,0,0,0.30)", s.style.border = "2.5px solid #aab7e9", s.style.borderRadius = "18px", s.style.padding = "18px 48px", s.style.fontFamily = "'Cinzel', 'Georgia', serif", s.style.fontWeight = "bold", s.style.fontSize = "1.25em", s.style.color = "#fffcfa", s.style.textShadow = "0 0 12px #5ee6e6, 0 2px 3px #110c28", s.style.letterSpacing = "1.5px", s.style.opacity = 0, s.style.transition = "opacity 0.3s cubic-bezier(.4,1.4,.4,1), transform 0.4s cubic-bezier(.42,2.2,.32,1.4)", i) {
        let t = document.createElement("img");
        t.src = i, t.style.width = "44px", t.style.height = "44px", t.style.borderRadius = "12px", t.style.boxShadow = "0 0 12px #fff, 0 2px 12px #4ee", t.style.background = "#111", s.appendChild(t)
    }
    let r = document.createElement("span");
    r.innerText = t, s.appendChild(r), document.body.appendChild(s), setTimeout((() => {
        s.style.opacity = 1, s.style.transform = "translate(-50%, 0) scale(1.10)"
    }), 30), setTimeout((() => {
        s.style.opacity = 0, s.style.transform = "translate(-50%, 0) scale(0.98)", setTimeout((() => {
            s.parentNode && s.parentNode.removeChild(s)
        }), 450)
    }), 1e3 * (e || 1.7))
}, SpectralReaper.attributes.add("attackDelay", {
    type: "number",
    default: 2.2
}), SpectralReaper.attributes.add("cooldown", {
    type: "number",
    default: 20
}), SpectralReaper.attributes.add("petPrefab", {
    type: "entity"
}), SpectralReaper.attributes.add("orbitRadius", {
    type: "number",
    default: 3
}), SpectralReaper.attributes.add("orbitSpeed", {
    type: "number",
    default: 120
}), SpectralReaper.attributes.add("orbitMinRadius", {
    type: "number",
    default: 2
}), SpectralReaper.attributes.add("orbitMaxRadius", {
    type: "number",
    default: 3.2
}), SpectralReaper.attributes.add("orbitMinHeight", {
    type: "number",
    default: .7
}), SpectralReaper.attributes.add("orbitMaxHeight", {
    type: "number",
    default: 1.4
}), SpectralReaper.attributes.add("moveSpeed", {
    type: "number",
    default: 2.2
}), SpectralReaper.attributes.add("orbitMode", {
    type: "string",
    enum: [{
        classic: "Klasik Orbit"
    }, {
        petlike: "Canlı Pet"
    }],
    default: "classic"
}), SpectralReaper.prototype.initialize = function() {
    this._pet = null, this._cooldownLeft = 0, this._orbitTime = 10 * Math.random(), this._targetPos = null, this._moveTimer = 0, this._attackDelayLeft = 0, this.petPrefab ? (this._pet = this.petPrefab.clone(), this._pet.enabled = !0, this.app.root.addChild(this._pet)) : console.warn("[SpectralReaper] petPrefab atanmadı!"), "petlike" === this.orbitMode && this._pickNewPetTarget()
}, SpectralReaper.prototype.update = function(t) {
    if (this._pet) {
        if ("classic" === this.orbitMode ? this._petClassicOrbit(t) : this._petPetlikeOrbit(t), this._cooldownLeft > 0) return this._cooldownLeft -= t, void(this._cooldownLeft <= 1e-4 && this._cooldownLeft > -1 && (this._cooldownLeft = -99, this._pet.sound && this._pet.sound.slot("skillReady") && this._pet.sound.slot("skillReady").play(), this._attackDelayLeft = this.attackDelay));
        if (this._attackDelayLeft > 0) this._attackDelayLeft -= t;
        else {
            var e = this._findNearestAliveMetin();
            e && (this.app.fire("pet:attackMetin", {
                pet: this._pet,
                target: e,
                owner: this.entity
            }), this._cooldownLeft = this.cooldown)
        }
    }
}, SpectralReaper.prototype._petClassicOrbit = function(t) {
    this._orbitTime = (this._orbitTime || 0) + this.orbitSpeed * t, this._orbitTime >= 360 && (this._orbitTime -= 360);
    var e = this._orbitTime * Math.PI / 180,
        i = this.entity.getPosition(),
        a = i.x + Math.cos(e) * this.orbitRadius,
        s = i.z + Math.sin(e) * this.orbitRadius;
    this._pet.setPosition(a, i.y + 1.2, s)
}, SpectralReaper.prototype._petPetlikeOrbit = function(t) {
    this._moveTimer -= t, (this._moveTimer <= 0 || !this._targetPos) && this._pickNewPetTarget();
    var e = this._pet.getPosition().clone(),
        i = this._targetPos,
        a = this.moveSpeed * t,
        s = e.lerp(e, i, Math.min(1, a / Math.max(e.distance(i), .01)));
    this._pet.setPosition(s)
}, SpectralReaper.prototype._pickNewPetTarget = function() {
    var t = Math.random() * Math.PI * 2,
        e = this.orbitMinRadius + Math.random() * (this.orbitMaxRadius - this.orbitMinRadius),
        i = this.orbitMinHeight + Math.random() * (this.orbitMaxHeight - this.orbitMinHeight),
        a = this.entity.getPosition(),
        s = a.x + Math.cos(t) * e,
        r = a.y + i,
        o = a.z + Math.sin(t) * e;
    this._targetPos = new pc.Vec3(s, r, o), this._moveTimer = 2.8 + 2.2 * Math.random()
}, SpectralReaper.prototype._findNearestAliveMetin = function() {
    var t = null,
        e = 1 / 0,
        i = this.entity.getPosition();
    return this.app.root.find((function(a) {
        if (a.tags && a.tags.has && a.tags.has("metin") && a.enabled && (!a.script || !a.script.metin || !a.script.metin.isDead)) {
            var s = i.distance(a.getPosition());
            s < e && (e = s, t = a)
        }
        return !1
    })), t
};
var PetOrbit = pc.createScript("petOrbit");
PetOrbit.prototype.initialize = function() {
    this._currentAngle = 360 * Math.random(), this._randomHeight = .7 + .6 * Math.random()
}, PetOrbit.prototype.postInitialize = function() {
    this.app.on("pet:orbit", this.handleOrbit, this)
}, PetOrbit.prototype.handleOrbit = function(t) {
    var i = t.pet,
        o = t.owner,
        r = t.dt,
        n = t.orbitRadius,
        e = t.orbitSpeed;
    i._orbitAngle || (i._orbitAngle = 360 * Math.random()), i._orbitAngle += e * r * (.8 + .4 * Math.random()), i._orbitAngle > 360 && (i._orbitAngle -= 360);
    var a = i._orbitAngle * Math.PI / 180,
        h = o.getPosition(),
        b = .8 + .35 * Math.sin(.001 * Date.now() + a),
        p = h.x + Math.cos(a) * n * (.95 + .1 * Math.random()),
        s = h.z + Math.sin(a) * n * (.95 + .1 * Math.random());
    i.setPosition(p, h.y + b, s)
};
var PetAttackFeedback = pc.createScript("petAttackFeedback");
PetAttackFeedback.attributes.add("choise_1", {
    type: "entity"
}), PetAttackFeedback.attributes.add("choise_2", {
    type: "entity"
}), PetAttackFeedback.prototype.initialize = function() {
    this.app.on("pet:attackMetin", this.handleAttack, this)
}, PetAttackFeedback.prototype.handleAttack = function(t) {
    var e = t.pet,
        i = t.target,
        a = t.owner;
    if (e && i) {
        var n = i && i.id || i && i.metinId || i && i.script && i.script.metin && i.script.metin.id || i && i.entityId || null;
        if (n) {
            var o = i.getPosition().clone(),
                s = e.getPosition().clone(),
                c = 0,
                p = this;
            e.anim && e.anim.setTrigger("attack"), e.sound && e.sound.slot("reaperAttack") && e.sound.slot("reaperAttack").play(), window.showPetSkillPopup && window.showPetSkillPopup("Petin bir Metini öldürdü!", 5, null);
            var flyTween = function(t) {
                (c += t / .22) > 1 && (c = 1);
                var d = s.lerp(s, o, c);
                e.setPosition(d), c < 1 ? e._flyTween = p.app.on("update", flyTween) : (i.particlesystem && i.particlesystem.play(), i.sound && i.sound.slot("metinDeath") && i.sound.slot("metinDeath").play(), Network.socket.emit("petAttackMetin", {
                    metinId: n,
                    petOwnerId: a.id
                }), e.setPosition(s), p.app.off("update", flyTween))
            };
            this.app.on("update", flyTween), window.str_value += 5, this.choise_1.enabled = !0, this.choise_2.enabled = !0
        } else console.error("PetAttackFeedback: Metin id’si bulunamadı! target:", i)
    }
};
var MusicManager = pc.createScript("musicManager");
MusicManager.attributes.add("musicAsset", {
    type: "asset",
    assetType: "audio"
}), MusicManager.prototype.initialize = function() {
    this.entity.sound || this.entity.addComponent("sound"), this.entity.sound.slot("mainMusic") || this.entity.sound.addSlot("mainMusic", {
        asset: this.musicAsset,
        loop: !0,
        volume: 0,
        autoPlay: !0
    }), window.musicManager = this
}, MusicManager.prototype.setVolume = function(t) {
    var i = this.entity.sound.slot("mainMusic");
    i && (i.volume = Math.max(0, Math.min(1, t)))
};
var SettingsPanel = pc.createScript("settingsPanel");
SettingsPanel.attributes.add("cursorAsset", {
    type: "asset",
    assetType: "texture"
}), SettingsPanel.prototype.initialize = function() {
    var e = document.getElementById("application-canvas");
    this.cursorAsset && (e.style.cursor = "url('" + this.cursorAsset.getFileUrl() + "') 10 5, auto"), this._panel = null, this._slider = null, this._lastValue = .6, this.createPanel(), this.hide(), this.app.keyboard.on(pc.EVENT_KEYDOWN, (function(e) {
        e.key === pc.KEY_ESCAPE && ("none" === this._panel.style.display ? this.show() : this.hide())
    }), this)
}, SettingsPanel.prototype.createPanel = function() {
    let e = document.createElement("div");
    e.style.position = "absolute", e.style.top = "15%", e.style.left = "50%", e.style.transform = "translate(-50%, 0)", e.style.background = "rgba(30,36,58,0.95)", e.style.border = "2.5px solid #aab7e9", e.style.borderRadius = "18px", e.style.boxShadow = "0 6px 30px 0 rgba(20,0,60,0.2), 0 1.5px 6px 0 rgba(0,0,0,0.20)", e.style.padding = "28px 36px 24px", e.style.fontFamily = "'Montserrat', 'Arial', sans-serif", e.style.fontSize = "1.18em", e.style.color = "#c5daf9", e.style.zIndex = 9998, e.style.minWidth = "340px", e.style.display = "none";
    let t = document.createElement("div");
    t.innerText = "Settings", t.style.marginBottom = "16px", t.style.fontSize = "1.3em", t.style.letterSpacing = "1.2px", t.style.color = "#fff", e.appendChild(t);
    let n = document.createElement("span");
    n.innerText = "Music Volume:", n.style.marginRight = "12px", e.appendChild(n);
    let s = document.createElement("input");
    s.type = "range", s.min = 0, s.max = 100, s.value = Math.round(100 * this._lastValue), s.style.width = "120px", s.oninput = function(e) {
        let t = s.value / 100;
        this._lastValue = t, window.musicManager && window.musicManager.setVolume(t)
    }.bind(this), e.appendChild(s);
    let i = document.createElement("button");
    i.innerText = "Close", i.style.marginTop = "22px", i.style.display = "block", i.style.marginLeft = "auto", i.style.marginRight = "auto", i.onclick = this.hide.bind(this), e.appendChild(document.createElement("br")), e.appendChild(i), document.body.appendChild(e), this._panel = e, this._slider = s
}, SettingsPanel.prototype.show = function() {
    this._panel && (this._panel.style.display = "block"), this._slider && (this._slider.value = Math.round(100 * (window.musicManager ? window.musicManager.entity.sound.slot("mainMusic").volume : this._lastValue)))
}, SettingsPanel.prototype.hide = function() {
    this._panel && (this._panel.style.display = "none")
};
var ModernSettingsPanel = pc.createScript("modernSettingsPanel");
ModernSettingsPanel.prototype.initialize = function() {
    this._panel = null, this._slider = null, this._lastValue = .6, this.createPanel(), this.hide(), this.app.keyboard.on(pc.EVENT_KEYDOWN, (function(e) {
        e.key === pc.KEY_P && ("none" === this._panel.style.display ? this.show() : this.hide())
    }), this)
}, ModernSettingsPanel.prototype.createPanel = function() {
    let e = document.createElement("div");
    e.style.position = "fixed", e.style.top = "50%", e.style.left = "50%", e.style.transform = "translate(-50%,-50%) scale(1)", e.style.background = "linear-gradient(120deg, #232940 75%, #2a2c37 100%)", e.style.border = "2.5px solid #30cfff", e.style.boxShadow = "0 12px 44px 0 rgba(25,200,255,0.22), 0 1.5px 9px 0 rgba(0,0,0,0.33)", e.style.borderRadius = "21px", e.style.padding = "36px 50px 34px", e.style.fontFamily = "'Cinzel', 'Montserrat', Arial, sans-serif", e.style.fontSize = "1.15em", e.style.color = "#eafcff", e.style.zIndex = 10015, e.style.minWidth = "340px", e.style.display = "none", e.style.transition = "opacity 0.23s cubic-bezier(.53,1.41,.2,.95), transform 0.37s cubic-bezier(.46,1.62,.4,0.9)", e.style.opacity = 0, e.style.outline = "none";
    let t = document.createElement("div");
    t.style.background = "url('https://upload.wikimedia.org/wikipedia/commons/3/33/Crystal_Project_game.png') center/cover no-repeat", t.style.width = "46px", t.style.height = "46px", t.style.margin = "0 auto 12px auto", t.style.borderRadius = "12px", t.style.boxShadow = "0 0 24px #31e2ff80", e.appendChild(t);
    let l = document.createElement("div");
    l.innerText = "Game Settings", l.style.marginBottom = "20px", l.style.fontSize = "1.23em", l.style.fontWeight = "bold", l.style.color = "#49efff", l.style.letterSpacing = "2.1px", l.style.textAlign = "center", l.style.textShadow = "0 0 10px #1abfcf, 0 2px 3px #0e2233", e.appendChild(l);
    let n = document.createElement("div");
    n.style.display = "flex", n.style.alignItems = "center", n.style.margin = "18px 0 8px 0";
    let s = document.createElement("span");
    s.innerText = "Music Volume", s.style.marginRight = "16px", s.style.color = "#8bf0f8", s.style.fontWeight = "bold", s.style.fontSize = "1.07em", n.appendChild(s);
    let i = document.createElement("input");
    i.type = "range", i.min = 0, i.max = 100, i.value = Math.round(100 * this._lastValue), i.style.width = "145px", i.style.verticalAlign = "middle", i.style.appearance = "none", i.style.background = "linear-gradient(90deg,#4edfff,#00a2c8 95%)", i.style.borderRadius = "7px", i.style.height = "7px", i.style.outline = "none", i.style.marginRight = "12px", i.style.boxShadow = "0 2px 16px #29dcff88", i.oninput = function(e) {
        let t = i.value / 100;
        o.innerText = " " + i.value + "%", this._lastValue = t, window.musicManager && window.musicManager.setVolume(t)
    }.bind(this), i.style.setProperty("accent-color", "#43eaff");
    let o = document.createElement("span");
    o.innerText = " " + i.value + "%", o.style.color = "#46fff0", o.style.fontWeight = "bold", o.style.textShadow = "0 0 6px #29dcffbb", o.style.fontSize = "1em", n.appendChild(i), n.appendChild(o), e.appendChild(n);
    let a = document.createElement("button");
    a.innerHTML = "&times;", a.style.position = "absolute", a.style.top = "8px", a.style.left = "18px", a.style.background = "none", a.style.border = "none", a.style.color = "#45e6ff", a.style.fontSize = "2em", a.style.fontWeight = "bold", a.style.cursor = "pointer", a.style.zIndex = "11", a.style.transition = "color 0.16s", a.onmouseenter = function() {
        a.style.color = "#fff"
    }, a.onmouseleave = function() {
        a.style.color = "#45e6ff"
    }, a.onclick = this.hide.bind(this), e.appendChild(a);
    let r = document.createElement("div");
    r.style.position = "absolute", r.style.left = "0", r.style.right = "0", r.style.bottom = "-16px", r.style.height = "34px", r.style.background = "radial-gradient(ellipse at center,#13f3ff80 0%,#00cfff05 100%)", r.style.borderRadius = "0 0 22px 22px", r.style.zIndex = 1, e.appendChild(r), ["pointerdown", "mousedown", "mouseup", "click", "dblclick", "contextmenu", "touchstart", "touchend", "touchmove"].forEach((t => {
        e.addEventListener(t, (function(t) {
            t.target !== e && t.target !== r || (t.stopPropagation(), t.preventDefault())
        }), !0)
    })), e.tabIndex = 0, document.body.appendChild(e), this._panel = e, this._slider = i
}, ModernSettingsPanel.prototype.show = function() {
    this._panel && (this._panel.style.display = "block", setTimeout((() => {
        this._panel.style.opacity = 1, this._panel.style.transform = "translate(-50%,-50%) scale(1.03)"
    }), 18), this._slider && (this._slider.value = Math.round(100 * (window.musicManager ? window.musicManager.entity.sound.slot("mainMusic").volume : this._lastValue))), this._panel.focus())
}, ModernSettingsPanel.prototype.hide = function() {
    this._panel && (this._panel.style.opacity = 0, this._panel.style.transform = "translate(-50%,-50%) scale(0.96)", setTimeout((() => {
        this._panel.style.display = "none"
    }), 270))
};
window.createMMOLoginPanel = function() {
    let e = document.getElementById("mmoLoginPanel");
    e && e.parentNode.remove();
    let t = document.getElementById("mmoLoginBG");
    t && t.parentNode.remove();
    let l = document.createElement("div");
    l.id = "mmoLoginBG", l.style.position = "fixed", l.style.left = "0", l.style.top = "0", l.style.width = "100vw", l.style.height = "100vh", l.style.zIndex = 10001, l.style.background = "linear-gradient(120deg,#2b234a 60%,#1b273b 100%)", l.style.backdropFilter = "blur(7px) brightness(0.82)", l.style.transition = "opacity 0.25s", document.body.appendChild(l);
    let n = document.createElement("div");
    n.id = "mmoLoginPanel", n.style.position = "fixed", n.style.top = "50%", n.style.left = "50%", n.style.transform = "translate(-50%,-50%)", n.style.background = "rgba(29,28,52,0.98)", n.style.border = "2.5px solid #9fd4ff", n.style.borderRadius = "22px", n.style.boxShadow = "0 10px 40px 0 rgba(60,90,200,0.21), 0 1.5px 10px 0 rgba(0,0,0,0.20)", n.style.padding = "38px 40px 30px", n.style.fontFamily = "'Cinzel', 'Montserrat', serif", n.style.color = "#f8fbff", n.style.zIndex = 10002, n.style.minWidth = "340px", n.style.maxWidth = "94vw", n.style.display = "flex", n.style.flexDirection = "column", n.style.alignItems = "center", n.style.opacity = 0, n.style.transition = "opacity 0.3s cubic-bezier(.4,1.4,.4,1), transform 0.38s cubic-bezier(.42,2.2,.32,1.4)", setTimeout((() => {
        n.style.opacity = 1, n.style.transform = "translate(-50%,-50%) scale(1.03)"
    }), 16);
    let o = document.createElement("div");
    o.innerText = "Metin2 Web2", o.style.fontSize = "2.3em", o.style.letterSpacing = "5px", o.style.fontWeight = "bold", o.style.textShadow = "0 2px 32px #8ae7ff44,0 1px 1px #233355", o.style.marginBottom = "22px", o.style.userSelect = "none", n.appendChild(o);
    let s = document.createElement("div");
    s.innerText = "Kullanıcı Adı", s.style.marginBottom = "3px", s.style.marginTop = "7px", s.style.color = "#86bdfb", s.style.fontSize = "1em", n.appendChild(s);
    let i = document.createElement("input");
    i.type = "text", i.placeholder = "Kullanıcı adınız...", i.style.padding = "8px 12px", i.style.marginBottom = "14px", i.style.width = "208px", i.style.border = "1.3px solid #295b8c", i.style.borderRadius = "7px", i.style.background = "#242648", i.style.color = "#e3eeff", i.style.fontSize = "1.09em", i.style.outline = "none", i.onfocus = e => i.style.borderColor = "#50dfff", i.onblur = e => i.style.borderColor = "#295b8c", n.appendChild(i);
    let a = document.createElement("div");
    a.innerText = "Şifre", a.style.marginBottom = "3px", a.style.color = "#86bdfb", n.appendChild(a);
    let r = document.createElement("input");
    r.type = "password", r.placeholder = "Şifreniz...", r.style.padding = "8px 12px", r.style.marginBottom = "17px", r.style.width = "208px", r.style.border = "1.3px solid #295b8c", r.style.borderRadius = "7px", r.style.background = "#242648", r.style.color = "#e3eeff", r.style.fontSize = "1.09em", r.style.outline = "none", r.onfocus = e => r.style.borderColor = "#50dfff", r.onblur = e => r.style.borderColor = "#295b8c", n.appendChild(r);
    let d = document.createElement("div");
    d.style.color = "#ff8888", d.style.fontSize = "1em", d.style.height = "20px", d.style.marginBottom = "10px", d.style.textAlign = "center", d.style.fontWeight = "bold", d.style.opacity = 0, n.appendChild(d);
    let y = document.createElement("button");
    y.innerText = "GİRİŞ YAP", y.style.width = "100%", y.style.marginTop = "6px", y.style.padding = "11px", y.style.background = "linear-gradient(90deg, #44c7ff 0%, #5276fc 100%)", y.style.color = "#fff", y.style.fontWeight = "bold", y.style.fontSize = "1.07em", y.style.border = "none", y.style.borderRadius = "8px", y.style.boxShadow = "0 2px 12px #163768a9", y.style.transition = "transform 0.17s, box-shadow 0.2s", y.style.cursor = "pointer", y.onmouseenter = e => y.style.transform = "scale(1.045)", y.onmouseleave = e => y.style.transform = "scale(1)", y.onclick = function() {
        let e = i.value.trim(),
            t = r.value;
        if (!e || !t) return d.innerText = "Lütfen kullanıcı adı ve şifre giriniz!", d.style.opacity = 1, n.style.animation = "shake 0.35s", void setTimeout((() => {
            n.style.animation = ""
        }), 370);
        y.disabled = !0, d.style.opacity = 1, d.style.color = "#ffc86a", d.innerText = "Giriş yapılıyor...", fetch("https://www.m2w2.com.tr/loadPlayerData.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                player_id: e,
                player_pass: t
            })
        }).then((e => e.json())).then((t => {
            "success" === t.status ? (d.style.color = "#00ffae", d.innerText = "Giriş başarılı!", window.globalPlayerId = e, window.app && window.app.fire && window.app.fire("login:success", e), setTimeout((() => {
                n.style.opacity = 0, l.style.opacity = 0, setTimeout((() => {
                    n.remove(), l.remove()
                }), 400)
            }), 350)) : (d.style.color = "#ff5858", d.innerText = "Kullanıcı adı veya şifre hatalı!", y.disabled = !1, n.style.animation = "shake 0.35s", setTimeout((() => {
                n.style.animation = ""
            }), 370))
        })).catch((e => {
            d.style.color = "#ff5858", d.innerText = "Sunucuya bağlanılamadı.", y.disabled = !1
        }))
    }, n.appendChild(y);
    let c = document.createElement("div");
    c.innerText = "veya", c.style.color = "#51e3ff", c.style.fontWeight = "bold", c.style.textAlign = "center", c.style.margin = "18px 0 10px 0", c.style.fontSize = "0.97em", c.style.letterSpacing = "2px", n.appendChild(c);
    let p = document.createElement("button");
    if (p.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" style="height:1.6em;vertical-align:middle;margin-right:13px;filter:drop-shadow(0 1px 2px #112);">Google ile Bağlan', p.style.width = "100%", p.style.padding = "10px", p.style.marginBottom = "6px", p.style.background = "#fff", p.style.color = "#252c48", p.style.fontWeight = "bold", p.style.fontSize = "1.04em", p.style.border = "none", p.style.borderRadius = "8px", p.style.boxShadow = "0 2px 8px #2833502c", p.style.cursor = "pointer", p.onmouseenter = e => p.style.background = "#ebf4fd", p.onmouseleave = e => p.style.background = "#fff", p.onclick = function() {
            d.style.color = "#ffc86a", d.innerText = "Google login simülasyonu (OAuth eklenebilir)", d.style.opacity = 1
        }, n.appendChild(p), window.addEventListener("keydown", (function escClose(e) {
            "Escape" === e.key && (n.parentNode && n.parentNode.removeChild(n), l.parentNode && l.parentNode.removeChild(l), window.removeEventListener("keydown", escClose))
        })), !document.getElementById("mmoLoginPanelStyles")) {
        let e = document.createElement("style");
        e.id = "mmoLoginPanelStyles", e.innerHTML = "\n            @keyframes shake {\n                0% { transform: translate(-50%,-50%) scale(1) }\n                15% { transform: translate(-53%,-48%) scale(1.03) }\n                32% { transform: translate(-48%,-52%) scale(0.98) }\n                48% { transform: translate(-50%,-50%) scale(1.04) }\n                65% { transform: translate(-51%,-49%) scale(1.01) }\n                82% { transform: translate(-49%,-51%) scale(0.99) }\n                100% { transform: translate(-50%,-50%) scale(1) }\n            }\n        ", document.head.appendChild(e)
    }
    document.body.appendChild(n)
};
var StartGirisPanel = pc.createScript("startGirisPanel");
StartGirisPanel.prototype.initialize = function() {
    window.createMMOLoginPanel()
}, StartGirisPanel.prototype.update = function(t) {};
var LoginHandler = pc.createScript("loginHandler");
LoginHandler.prototype.initialize = function() {
    this.app.on("login:success", (function(n) {
        console.log("Login başarılı, kullanıcı:", n), this.startGame(n)
    }), this)
}, LoginHandler.prototype.startGame = function(n) {
    console.log("Login başarılı, kullanıcı:", n)
};
var Minimap = pc.createScript("minimap");
Minimap.attributes.add("playerEntity", {
    type: "entity"
}), Minimap.attributes.add("minimapScreen", {
    type: "entity"
}), Minimap.attributes.add("minimapBg", {
    type: "entity"
}), Minimap.attributes.add("playerIcon", {
    type: "entity"
}), Minimap.attributes.add("metinIconPrefab", {
    type: "asset",
    assetType: "template"
}), Minimap.attributes.add("worldMin", {
    type: "vec2",
    default: [-55, -55]
}), Minimap.attributes.add("worldMax", {
    type: "vec2",
    default: [55, 55]
}), Minimap.prototype.iconSize = 50, Minimap.prototype.iconMargin = 2, Minimap.prototype.initialize = function() {
    this.zoomSteps = [.5, .75, 1, 1.5, 2], this.zoomIndex = 2, this.minimapZoom = this.zoomSteps[this.zoomIndex], this.minimapRadiusWorld = 16, this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this), this._metinIcons = []
}, Minimap.prototype.onKeyDown = function(t) {
    "1" !== t.key && 49 !== t.keyCode || this.zoomIndex < this.zoomSteps.length - 1 && (this.zoomIndex++, this.minimapZoom = this.zoomSteps[this.zoomIndex]), "2" !== t.key && 50 !== t.keyCode || this.zoomIndex > 0 && (this.zoomIndex--, this.minimapZoom = this.zoomSteps[this.zoomIndex])
}, Minimap.prototype.update = function(t) {
    var i = this.playerEntity.getPosition(),
        e = this.minimapBg.element.width,
        n = this.minimapBg.element.height,
        a = e / 2,
        o = (this.iconSize || 50) / 2,
        s = this.iconMargin || 0,
        m = this.minimapRadiusWorld / this.minimapZoom,
        p = pc.math.clamp(i.x - m, this.worldMin.x, this.worldMax.x - 2 * m),
        h = pc.math.clamp(i.z - m, this.worldMin.y, this.worldMax.y - 2 * m),
        r = p + 2 * m,
        d = h + 2 * m;
    this.playerIcon.setLocalPosition(0, 0, 0);
    var c = this.playerEntity.getRotation(),
        l = new pc.Vec3(0, 0, 1);
    c.transformVector(l, l), l.x *= -1, l.z *= -1;
    var y = Math.atan2(l.x, l.z),
        M = pc.math.RAD_TO_DEG * y;
    this.playerIcon.setLocalEulerAngles(0, 0, +M + 180);
    var z = [];
    this.app.root.find((function(t) {
        if (t.tags && t.tags.has("metin") && t.enabled && t.script && t.script.metin && !t.script.metin.isDead) {
            var i = t.getPosition();
            i.x >= p && i.x <= r && i.z >= h && i.z <= d && z.push(t)
        }
        return !1
    }));
    for (let t = z.length; t < this._metinIcons.length; t++) this._metinIcons[t].enabled = !1;
    for (let t = 0; t < z.length; t++) {
        let i = z[t].getPosition();
        var u = ((i.x - p) / (r - p) - .5) * e,
            x = (.5 - (i.z - h) / (d - h)) * n,
            g = a - o - s;
        if (Math.sqrt(u * u + x * x) > g) {
            var I = Math.atan2(x, u);
            u = Math.cos(I) * g, x = Math.sin(I) * g
        }
        let m = this._metinIcons[t];
        m || (m = this.metinIconPrefab.resource.instantiate(), this.minimapBg.addChild(m), this._metinIcons[t] = m), m.enabled = !0, m.setLocalPosition(u, x, 0)
    }
};
var MetinHealth = pc.createScript("metinHealth");
MetinHealth.attributes.add("maxHP", {
    type: "number",
    default: 5e3
}), MetinHealth.prototype.initialize = function() {
    this.currentHP = this.maxHP, this.entity.on("update:hp", this.updateHP, this)
}, MetinHealth.prototype.updateHP = function(t) {
    this.currentHP = t, this.currentHP <= 0 && (this.currentHP = 0, this.entity.fire("metin:dead")), this.entity.fire("metin:updateHealthBar", this.currentHP / this.maxHP)
};
var DisableEntity = pc.createScript("disableEntity");
DisableEntity.attributes.add("target1", {
    type: "entity"
}), DisableEntity.attributes.add("target2", {
    type: "entity"
}), DisableEntity.attributes.add("target3", {
    type: "entity"
}), DisableEntity.prototype.initialize = function() {
    this.target1 && this.target1.enabled && (this.target1.enabled = !1), this.target2 && this.target2.enabled && (this.target2.enabled = !1), this.target3 && this.target3.enabled && (this.target3.enabled = !1)
}, DisableEntity.prototype.update = function() {
    this.target1 && this.target1.enabled && (this.target1.enabled = !1), this.target2 && this.target2.enabled && (this.target2.enabled = !1), this.target3 && this.target3.enabled && (this.target3.enabled = !1)
};
var InventoryUi = pc.createScript("inventoryUi");
InventoryUi.prototype.initialize = function() {
    if (!document.getElementById("inventory-panel")) {
        document.body.insertAdjacentHTML("beforeend", '\n        <div id="inventory-panel" style="display:none;">\n          <div id="inventory-title">Envanter</div>\n          <div id="inventory-grid"></div>\n          <button id="close-inventory">Kapat</button>\n          <button id="page1-btn">1. Sayfa</button>\n          <button id="page2-btn">2. Sayfa</button>\n        </div>\n        ')
    }
};
var InventoryDom = pc.createScript("inventoryDom");
InventoryDom.attributes.add("tooltipEntity", {
    type: "entity",
    title: "Tooltip Entity"
}), InventoryDom.prototype.initialize = function() {
    var e = this,
        t = 0,
        n = this.tooltipEntity.script.metin2Tooltip;

    function getItemProto() {
        return window.ITEM_PROTO || []
    }
    let l = [Array(45).fill(null), Array(45).fill(null)];
    if (getItemProto().slice(0, 60).forEach((function(e, t) {
            l[0][t] = {
                vnum: e.VNUM
            }
        })), !document.getElementById("inventory-panel")) {
        const e = document.createElement("div");
        e.id = "inventory-panel", e.style.position = "absolute", e.style.top = "10%", e.style.left = "50%", e.style.transform = "translate(-50%,0)", e.style.background = "rgba(24,34,44,0.97)", e.style.border = "2px solid #79aaff", e.style.borderRadius = "16px", e.style.padding = "20px 32px", e.style.minWidth = "257px", e.style.zIndex = "9999", e.style.display = "none";
        const t = document.createElement("div");
        t.innerText = "ENVANTER", t.style.color = "#fff", t.style.fontSize = "1.3em", t.style.marginBottom = "15px", t.style.letterSpacing = "1.1px", t.style.textAlign = "center", e.appendChild(t);
        const n = document.createElement("div");
        n.id = "inventory-grid", n.style.display = "grid", n.style.gridTemplateColumns = "repeat(5, 44px)", n.style.gridTemplateRows = "repeat(9, 44px)", n.style.gridGap = "8px", n.style.marginBottom = "20px", e.appendChild(n);
        let l = document.createElement("div");
        l.style.textAlign = "center", l.style.marginBottom = "6px";
        let o = document.createElement("button");
        o.id = "page1-btn", o.innerText = "1. Sayfa", o.style.marginRight = "12px", l.appendChild(o);
        let i = document.createElement("button");
        i.id = "page2-btn", i.innerText = "2. Sayfa", l.appendChild(i), e.appendChild(l);
        let r = document.createElement("button");
        r.id = "close-inventory", r.innerText = "Kapat", r.style.display = "block", r.style.margin = "0 auto", r.style.marginTop = "8px", e.appendChild(r), document.body.appendChild(e)
    }
    let o = null;

    function renderInventory(o = 0) {
        t = o;
        const i = document.getElementById("inventory-grid");
        i.innerHTML = "";
        for (let t = 0; t < 45; t++) {
            let r = document.createElement("div");
            r.className = "inventory-slot", r.dataset.index = t, r.style.width = "44px", r.style.height = "44px", r.style.background = "#181f29", r.style.border = "2px solid #2e415b", r.style.borderRadius = "9px", r.style.display = "flex", r.style.alignItems = "center", r.style.justifyContent = "center", r.style.cursor = "pointer", r.style.position = "relative", r.style.transition = "border 0.12s";
            let d = l[o][t];
            if (d) {
                let t = getItemProto().find((e => e.VNUM === d.vnum)),
                    l = document.createElement("img");
                l.className = "inventory-item";
                let o = e.app.assets.find(t.ICON_NAME, "texture");
                l.src = o ? o.getFileUrl() : "default_icon.png", l.draggable = !0, l.style.width = "40px", l.style.height = "40px", l.style.objectFit = "contain", l.style.display = "block", l.style.pointerEvents = "auto", l.style.userSelect = "none", l.addEventListener("dragstart", onItemDragStart), l.addEventListener("dragend", onItemDragEnd), l.addEventListener("mouseenter", (function(e) {
                    n.show(t, e, this.parentElement)
                })), l.addEventListener("mouseleave", (function(e) {
                    n.hide()
                })), l.addEventListener("mousemove", (function(e) {
                    n.show(t, e, this.parentElement)
                })), r.appendChild(l)
            }
            r.addEventListener("dragover", (e => {
                e.preventDefault(), r.style.border = "2.5px solid #6b97e3"
            })), r.addEventListener("dragleave", (() => {
                r.style.border = "2px solid #2e415b"
            })), r.addEventListener("drop", onItemDrop), i.appendChild(r)
        }
    }

    function onItemDragStart(e) {
        o = parseInt(e.target.parentElement.dataset.index), e.dataTransfer.effectAllowed = "move", e.target.style.opacity = "0.6"
    }

    function onItemDragEnd(e) {
        e.target.style.opacity = "1.0"
    }

    function onItemDrop(e) {
        e.preventDefault(), this.style.border = "2px solid #2e415b";
        const n = parseInt(this.dataset.index);
        null !== o && o !== n && ([l[t][o], l[t][n]] = [l[t][n], l[t][o]], renderInventory(t)), o = null
    }
    document.addEventListener("keydown", (function(e) {
        if ("i" === e.key || "I" === e.key) {
            const e = document.getElementById("inventory-panel");
            "none" === e.style.display ? (renderInventory(t), e.style.display = "block") : e.style.display = "none"
        }
    })), document.getElementById("page1-btn").onclick = () => {
        renderInventory(0)
    }, document.getElementById("page2-btn").onclick = () => {
        renderInventory(1)
    }, document.getElementById("close-inventory").onclick = () => {
        document.getElementById("inventory-panel").style.display = "none"
    }
};
var InventorySlots = pc.createScript("inventorySlots");
InventorySlots.attributes.add("slotPrefab", {
    type: "entity"
}), InventorySlots.prototype.initialize = function() {
    if (!this.slotPrefab) return void console.error("[InventorySlots] slotPrefab attribute atanmamış!");
    this.slotPrefab.enabled || (this.slotPrefab.enabled = !0);
    let t = 0;
    for (let e = 0; e < 9; e++)
        for (let o = 0; o < 5; o++) {
            let l = this.slotPrefab.clone();
            l.name = "Slot_" + t, l.setLocalPosition(57 * o - 114, 228 - 57 * e, 0), this.entity.addChild(l), l.enabled = !0, t++
        }
    this.slotPrefab.enabled = !1, console.log("[InventorySlots] Tüm slotlar grid olarak dizildi.")
};
var ItemProtoLoader = pc.createScript("itemProtoLoader");
ItemProtoLoader.attributes.add("protoFile", {
    type: "asset",
    assetType: "text",
    title: "Item Proto (.txt)"
}), ItemProtoLoader.prototype.initialize = function() {
    this.protoFile.ready((function(t) {
        var e = t.resource.split("\n"),
            o = [];
        window.ITEM_PROTO = [], e.forEach((function(t, e) {
            if (t.trim()) {
                var r = t.replace(/\r/g, "").split("\t");
                if (0 === e) o = r.map((t => t.trim()));
                else {
                    for (var i = {}, a = 0; a < o.length; a++) {
                        var n = r[a] || "";
                        isNaN(n) || "" === n.trim() || (n = Number(n)), i[o[a]] = n
                    }
                    var p = i.ICON_NAME;
                    p && !p.endsWith(".png") && (p += ".png"), i.ICON_NAME = p, window.ITEM_PROTO.push(i)
                }
            }
        })), console.log("[ITEM_PROTO] yüklenme tamamlandı:", window.ITEM_PROTO)
    }))
};
var Metin2Tooltip = pc.createScript("metin2Tooltip");
Metin2Tooltip.prototype.initialize = function() {
    if (!document.getElementById("metin2-tooltip")) {
        const e = document.createElement("div");
        e.id = "metin2-tooltip", e.style.position = "fixed", e.style.zIndex = "10001", e.style.background = "rgba(19, 28, 40, 0.95)", e.style.border = "2px solid #00caff", e.style.color = "#f2e9dc", e.style.padding = "18px 24px", e.style.borderRadius = "12px", e.style.pointerEvents = "none", e.style.display = "none", e.style.fontFamily = "Verdana, Arial, sans-serif", e.style.minWidth = "230px", e.style.maxWidth = "340px", e.style.boxShadow = "0 2px 24px #0e192650", e.style.whiteSpace = "pre-line", document.body.appendChild(e)
    }
    this.tip = document.getElementById("metin2-tooltip")
}, Metin2Tooltip.prototype.show = function(e, t, i) {
    if (!e) return;
    const o = this.tip;
    let n = `<div style="font-size:1.15em;font-weight:bold;color:#ffe270;text-shadow:0 1px 2px #000;">${e.NAME||""}</div>`;
    (e.TYPE || e.SLOT) && (n += `<div style="color:#8ec3f7;font-size:0.95em;margin-bottom:7px;text-shadow:0 1px 2px #111;">[${e.SLOT||e.TYPE||""}]</div>`), void 0 !== e.LEVEL && (n += `<div style="color:#d8ebff;font-size:0.95em;margin-bottom:5px;">Seviye: <b>${e.LEVEL}</b></div>`);
    let l = [];

    function ekle(e, t, i = "+", o = "#ffe270") {
        t && 0 !== t && "" !== t && l.push(`<div style="color:${o};font-size:1.05em;">${e}: <b>${i}${t}</b></div>`)
    }
    ekle("Güç", e.STR), ekle("Max HP", e.MAX_HP), ekle("Saldırı Hızı", e.ATT_SPEED, "+", "#a6f9ff"), ekle("Kritik", e.CRIT, "%", "#f993e0"), ekle("Büyü Hızı", e.CAST_SPEED, "+", "#c0ffb0"), ekle("Delici", e.PENETRATE, "%", "#fbb48b"), ekle("Hareket Hızı", e.MOV_SPEED > 0 ? "+" : "", e.MOV_SPEED, "#b4d2ff"), ekle("Blok", e.BLOCK, "%", "#ffd89b"), ekle("Savaşçıya Direnç", e.RESIST_WARRIOR, "%", "#ffc7b2"), ekle("Savunma", e.DEF, "+", "#bcffad"), e.REFINE && "-" !== e.REFINE && (n += `<div style="color:#ffe270;font-size:1em;margin-bottom:7px;">Yükseltme: <b>${e.REFINE}</b></div>`), l.length > 0 && (n += `<div style="margin:5px 0 0 0;text-align:center;">${l.join("")}</div>`), (e.SOCKET1 || e.SOCKET2 || e.SOCKET3) && (n += '<div style="margin-top:10px;text-align:center;"><span style="color:#77ffe7;">Taş / Metin Slotları:</span><br>', [e.SOCKET1, e.SOCKET2, e.SOCKET3].forEach(((e, t) => {
        n += e && "0" !== e ? `<span style="color:#90fbb0;margin-right:7px;">[${e}]</span>` : '<span style="color:#8a8a8a;margin-right:7px;">[Boş]</span>'
    })), n += "</div>"), n += `<div style="color:#c5e0ff;font-size:0.87em;margin-top:10px;opacity:0.8;">VNUM: ${e.VNUM||""}</div>`, o.innerHTML = `<div style="text-align:center;line-height:1.34;">${n}</div>`, o.style.display = "block", setTimeout((function() {
        let e = 0,
            n = 0;
        if (i) {
            const t = i.getBoundingClientRect();
            e = t.left + t.width / 2 - o.offsetWidth / 2, n = t.bottom + 8
        } else t && (e = t.clientX + 18, n = t.clientY + 16);
        e < 4 && (e = 4), e + o.offsetWidth > window.innerWidth && (e = window.innerWidth - o.offsetWidth - 6), n + o.offsetHeight > window.innerHeight && (n = window.innerHeight - o.offsetHeight - 6), o.style.left = e + "px", o.style.top = n + "px"
    }), 4)
}, Metin2Tooltip.prototype.hide = function() {
    this.tip && (this.tip.style.display = "none")
}, Metin2Tooltip.prototype.move = function(e, t) {
    this.show(this.lastItem, e, t)
};
var BonusWindowUI = pc.createScript("bonusWindowUI");
BonusWindowUI.prototype.initialize = function() {
    window.yari_insan_value = 0, window.guc_value = 0, window.zeka_value = 0, window.kritik_value = 0, window.sav_guc_value = 0, window.sur_guc_value = 0, window.sav_sav_value = 0, window.sur_sav_value = 0, window.ort_zarar_value = 0, window.bec_hasari_value = 0, window.patron_guc_value = 0, window.seytan_guc_value = 0, window.olumsuz_guc_value = 0, window.simsek_sav_value = 0, window.ruzgar_sav_value = 0, window.metin_guc_value = 0, window.str_value = 0;
    var n = this;
    console.log("BonusWindowUI script initialize edildi.");
    let a = 0;
    var e = document.createElement("style");
    e.textContent = "\n        /* Genel body stilleri (PlayCanvas'ın kendi canvas'ını etkilememesi için dikkatli olunmalı) */\n        body {\n            font-family: \"Inter\", sans-serif;\n            margin: 0;\n            padding: 0;\n            overflow: hidden; /* PlayCanvas genellikle bu ayarı kullanır */\n        }\n\n        /* Bonus Penceresi Stilleri */\n        #bonus-window {\n            position: fixed;\n            top: 10%;\n            left: 50%;\n            transform: translate(-50%, 0);\n            background: rgba(10, 15, 20, 0.98); /* Çok koyu, hafif şeffaf arka plan */\n            border: 2px solid #4a3b2e; /* Koyu kahverengi/bronz kenarlık */\n            border-radius: 4px; /* Daha keskin köşeler */\n            box-shadow: 0 8px 24px rgba(0,0,0,0.8); /* Daha belirgin gölge */\n            min-width: 400px; /* Genişliği artır */\n            max-width: 450px; /* Maksimum genişlik */\n            width: 90%; /* Responsive genişlik */\n            z-index: 10000;\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            display: none; /* Başlangıçta gizli */\n            overflow: hidden; /* İçerik taşmasını engelle */\n            padding-bottom: 10px; /* Alt butonlar için boşluk */\n        }\n\n        #bonus-window .header {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            padding: 8px 15px; /* Daha az padding */\n            font-size: 1.1em; /* Biraz daha küçük font */\n            color: #c0c0c0; /* Gümüş rengi başlık metni */\n            border-bottom: 1px solid #303540; /* Daha ince kenarlık */\n            background: linear-gradient(to right, #20252b 0%, #303540 100%); /* Metalik gradyan */\n            text-shadow: 1px 1px 2px rgba(0,0,0,0.7); /* Metne gölge */\n            border-top-left-radius: 4px;\n            border-top-right-radius: 4px;\n        }\n\n        #bonus-window .header button {\n            background: #404550; /* Kapatma butonu arka planı */\n            border: 1px solid #606570; /* Kapatma butonu kenarlığı */\n            color: #e0e0e0; /* Kapatma butonu metin rengi */\n            font-size: 1.1em;\n            cursor: pointer;\n            padding: 2px 7px; /* Daha küçük padding */\n            border-radius: 3px;\n            transition: background-color 0.2s ease, border-color 0.2s ease;\n            box-shadow: 0 1px 2px rgba(0,0,0,0.5);\n        }\n        #bonus-window .header button:hover {\n            background-color: #505560;\n            border-color: #707580;\n        }\n\n        #bonus-window .bonus-content {\n            padding: 10px 15px; /* İçerik padding'i */\n            background: rgba(0, 0, 0, 0.7); /* Çok koyu, daha şeffaf içerik alanı */\n            height: 325px; /* Sabit yükseklik, tüm bonusları sığdıracak şekilde artırıldı */\n            overflow-y: auto; /* İçerik taşarsa kaydırma çubuğu ekle (şimdilik görünmeyecek) */\n            display: grid; /* Izgara düzeni */\n            grid-template-columns: 1fr 1fr; /* İki eşit sütun */\n            gap: 8px 15px; /* Satır ve sütun arası boşluk */\n            align-content: start; /* İçeriği yukarı hizala */\n        }\n\n        #bonus-window .bonus-item {\n            display: flex;\n            flex-direction: column; /* Etiket ve değer alt alta */\n            align-items: flex-start; /* Sola hizala */\n            margin-bottom: 5px; /* Öğeler arası dikey boşluk */\n            position: relative; /* Bilgi ikonu için */\n        }\n\n        #bonus-window .bonus-label {\n            color: #c0c0c0; /* Açık gri metin */\n            font-size: 0.9em;\n            margin-bottom: 2px; /* Etiket ile değer kutusu arası boşluk */\n            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);\n        }\n\n        #bonus-window .value-box {\n            background: #1a1a1a; /* Koyu, içe gömülü kutu arka planı */\n            border: 1px solid #404040; /* Koyu kenarlık */\n            border-radius: 2px;\n            padding: 3px 6px;\n            width: 100%; /* Sütun genişliğine yayıl */\n            box-shadow: inset 0 1px 3px rgba(0,0,0,0.6); /* İçe gömülü gölge */\n            display: flex;\n            align-items: center;\n            min-height: 24px; /* Minimum yükseklik */\n        }\n\n        #bonus-window .bonus-icon {\n            font-size: 0.9em; /* Emoji boyutu */\n            margin-right: 5px;\n            opacity: 0.8;\n            filter: drop-shadow(0 0 1px rgba(255,255,255,0.5)); /* Hafif parlama */\n        }\n\n        #bonus-window .bonus-value {\n            color: #f0e68c; /* Soluk altın sarısı */\n            font-size: 0.95em;\n            font-weight: bold;\n            flex-grow: 1; /* Değerin boşluğu doldurmasını sağla */\n            text-align: left; /* Değeri sola hizala */\n            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);\n        }\n\n        .info-icon {\n            cursor: pointer;\n            font-size: 0.8em;\n            color: #88bbff; /* Açık mavi */\n            margin-left: 5px;\n            transition: color 0.2s ease;\n            text-shadow: 0 0 3px rgba(136, 187, 255, 0.5);\n        }\n        .info-icon:hover {\n            color: #a0d0ff; /* Daha açık mavi */\n            text-shadow: 0 0 5px rgba(160, 208, 255, 0.8);\n        }\n\n        #bonus-window .bottom-buttons {\n            display: flex;\n            justify-content: center;\n            gap: 10px;\n            padding: 8px 15px;\n            background: #20252b; /* Alt buton alanı arka planı */\n            border-top: 1px solid #303540;\n            border-bottom-left-radius: 4px;\n            border-bottom-right-radius: 4px;\n        }\n\n        #bonus-window .bottom-buttons button {\n            background: linear-gradient(to bottom, #404550 0%, #303540 100%); /* Metalik buton gradyanı */\n            border: 1px solid #606570;\n            color: #e0e0e0;\n            font-size: 0.9em;\n            font-weight: bold;\n            padding: 5px 15px;\n            border-radius: 3px;\n            cursor: pointer;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.6);\n            transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;\n            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);\n        }\n        #bonus-window .bottom-buttons button:hover {\n            background: linear-gradient(to bottom, #505560 0%, #404550 100%);\n            border-color: #707580;\n            transform: translateY(-1px);\n        }\n        #bonus-window .bottom-buttons button:active {\n            transform: translateY(0);\n            box-shadow: inset 0 1px 3px rgba(0,0,0,0.6);\n        }\n\n        #bonus-window .tab-bar {\n            display: flex;\n            justify-content: center; /* Sekmeleri ortaya hizala */\n            padding: 8px 0;\n            background: #20252b; /* Sekme çubuğu arka planı */\n            border-top: 1px solid #303540; /* Üst kenarlık */\n            border-bottom-left-radius: 4px; /* Alt köşeleri yuvarla */\n            border-bottom-right-radius: 4px;\n            margin-top: auto; /* İçeriğin altına it */\n        }\n\n        #bonus-window .tab-bar button {\n            flex: none; /* Esnekliği kaldır */\n            width: 100px; /* Sabit genişlik */\n            padding: 6px 0;\n            font-size: 0.9em;\n            font-weight: bold;\n            border: 1px solid #404550; /* Metalik kenarlık */\n            background: linear-gradient(to bottom, #303540 0%, #20252b 100%); /* Metalik gradyan */\n            color: #a0a0a0; /* Muted gri metin */\n            border-radius: 3px;\n            cursor: pointer;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.6);\n            transition: all 0.2s ease;\n            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);\n            margin: 0 5px; /* Sekmeler arası boşluk */\n        }\n        #bonus-window .tab-bar button.active {\n            background: linear-gradient(to bottom, #ffd700 0%, #ccaa00 100%); /* Parlak altın gradyan */\n            border-color: #ffea00; /* Altın kenarlık */\n            color: #302000; /* Koyu metin */\n            box-shadow: 0 0 8px rgba(255,215,0,0.7); /* Altın parlama */\n            transform: translateY(-2px); /* Hafif yukarı kaydır */\n        }\n        #bonus-window .tab-bar button:hover:not(.active) {\n            background: linear-gradient(to bottom, #404550 0%, #303540 100%);\n            border-color: #707580;\n            transform: translateY(-1px);\n        }\n        #bonus-window .tab-bar button:active {\n            transform: translateY(0);\n            box-shadow: inset 0 1px 3px rgba(0,0,0,0.6);\n        }\n\n        /* Modal Stilleri */\n        .modal-overlay {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: rgba(0, 0, 0, 0.7); /* Koyu şeffaf arka plan */\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            z-index: 10001; /* Bonus penceresinden daha yüksek */\n            display: none; /* Başlangıçta gizli */\n        }\n\n        .modal-content {\n            background: rgba(18, 25, 34, 0.98); /* Bonus penceresiyle aynı arka plan */\n            border: 2px solid #5a4b3d; /* Bonus penceresiyle aynı kenarlık */\n            border-radius: 8px;\n            padding: 20px;\n            width: 90%;\n            max-width: 400px;\n            box-shadow: 0 8px 24px rgba(0,0,0,0.8);\n            color: #e0e0e0;\n            position: relative;\n            text-align: left;\n        }\n\n        .modal-header {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            margin-bottom: 15px;\n            padding-bottom: 10px;\n            border-bottom: 1px solid #303540;\n        }\n\n        .modal-title {\n            font-size: 1.2em;\n            font-weight: bold;\n            color: #ffd700; /* Altın rengi başlık */\n            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);\n        }\n\n        .modal-close-btn {\n            background: none;\n            border: none;\n            color: #c0c0c0;\n            font-size: 1.5em;\n            cursor: pointer;\n            transition: color 0.2s ease;\n        }\n        .modal-close-btn:hover {\n            color: #fff;\n        }\n\n        .modal-body {\n            font-size: 0.95em;\n            line-height: 1.5;\n            color: #c0c0c0;\n        }\n\n        /* Modal içindeki spinner için stil, artık kullanılmayacak ama bırakılabilir */\n        .modal-body .loading-spinner {\n            border: 4px solid #f3f3f3;\n            border-top: 4px solid #ffd700; /* Altın sarısı spinner */\n            border-radius: 50%;\n            width: 24px;\n            height: 24px;\n            animation: spin 1s linear infinite;\n            display: inline-block;\n            vertical-align: middle;\n            margin-right: 10px;\n        }\n        @keyframes spin {\n            0% { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n        }\n\n        /* Responsive ayarlar */\n        @media (max-width: 480px) {\n            #bonus-window {\n                min-width: unset;\n                width: 95%;\n                top: 5%; /* Küçük ekranlarda daha yukarıda başla */\n            }\n            #bonus-window .bonus-content {\n                grid-template-columns: 1fr; /* Tek sütunlu düzen */\n            }\n            .header, .tab-bar, .bonus-content, .bottom-buttons {\n                padding-left: 10px;\n                padding-right: 10px;\n            }\n            .modal-content {\n                width: 95%;\n                padding: 15px;\n            }\n        }\n    ", document.head.appendChild(e), n.BONUS_DATA = {
        pvm: [{
            icon: "👹",
            label: "Patronlara Karşı Güçlü",
            getValue: () => window.patron_guc_value,
            format: "%",
            increment: 10,
            windowRef: "patron_guc_value",
            description: "Bu bonus, patron canavarlara karşı verdiğiniz hasarı artırır. Özellikle boss kesimlerinde etkilidir."
        }, {
            icon: "💪",
            label: "Güç",
            getValue: () => window.guc_value,
            format: "",
            increment: 12,
            windowRef: "guc_value",
            description: "Karakterinizin temel saldırı gücünü ve bazı becerilerin hasarını artırır."
        }, {
            icon: "🧠",
            label: "Zeka",
            getValue: () => window.zeka_value,
            format: "",
            increment: 12,
            windowRef: "zeka_value",
            description: "Büyücü karakterlerin büyü hasarını ve mana miktarını artırır. Diğer karakterler için de bazı faydaları olabilir."
        }, {
            icon: "🎯",
            label: "Kritik Vuruş Şansı",
            getValue: () => window.kritik_value,
            format: "%",
            increment: 100,
            windowRef: "kritik_value",
            description: "Saldırılarınızın kritik vuruş yapma olasılığını artırır. Kritik vuruşlar normalden daha fazla hasar verir."
        }, {
            icon: "😈",
            label: "Şeytanlara Karşı Güçlü",
            getValue: () => window.seytan_guc_value,
            format: "%",
            increment: 10,
            windowRef: "seytan_guc_value",
            description: "Şeytan sınıfı canavarlara karşı verdiğiniz hasarı artırır."
        }, {
            icon: "💀",
            label: "Ölümsüzlere Karşı Güçlü",
            getValue: () => window.olumsuz_guc_value,
            format: "%",
            increment: 10,
            windowRef: "olumsuz_guc_value",
            description: "Ölümsüz sınıfı canavarlara karşı verdiğiniz hasarı artırır."
        }, {
            icon: "⚡",
            label: "Şimşeğe Karşı Dayanıklılık",
            getValue: () => window.simsek_sav_value,
            format: "%",
            increment: 10,
            windowRef: "simsek_sav_value",
            description: "Şimşek elementine sahip saldırılardan aldığınız hasarı azaltır."
        }, {
            icon: "🌬️",
            label: "Rüzgara Karşı Dayanıklılık",
            getValue: () => window.ruzgar_sav_value,
            format: "%",
            increment: 10,
            windowRef: "ruzgar_sav_value",
            description: "Rüzgar elementine sahip saldırılardan aldığınız hasarı azaltır."
        }, {
            icon: "🪨",
            label: "Metin Taşlarına Karşı Güçlü",
            getValue: () => window.metin_guc_value,
            format: "%",
            increment: 10,
            windowRef: "metin_guc_value",
            description: "Metin taşlarına karşı verdiğiniz hasarı artırır. Metin kasarken çok işe yarar."
        }, {
            icon: "📈",
            label: "Ortalama Zarar",
            getValue: () => window.ort_zarar_value,
            format: "%",
            increment: 10,
            windowRef: "ort_zarar_value",
            description: "Normal saldırılarınızın ve bazı becerilerinizin ortalama hasarını artırır."
        }],
        pvp: [{
            icon: "🧑‍🤝‍🧑",
            label: "Yarı İnsanlara Karşı Güçlü",
            getValue: () => window.yari_insan_value,
            format: "%",
            increment: 10,
            windowRef: "yari_insan_value",
            description: "Oyunculara (yarı insanlara) karşı verdiğiniz hasarı artırır. PvP modunda çok önemlidir."
        }, {
            icon: "💪",
            label: "Güç",
            getValue: () => window.guc_value,
            format: "",
            increment: 12,
            windowRef: "guc_value",
            description: "Karakterinizin temel saldırı gücünü ve bazı becerilerin hasarını artırır."
        }, {
            icon: "🧠",
            label: "Zeka",
            getValue: () => window.zeka_value,
            format: "",
            increment: 12,
            windowRef: "zeka_value",
            description: "Büyücü karakterlerin büyü hasarını ve mana miktarını artırır. Diğer karakterler için de bazı faydaları olabilir."
        }, {
            icon: "🎯",
            label: "Kritik Vuruş Şansı",
            getValue: () => window.kritik_value,
            format: "%",
            increment: 100,
            windowRef: "kritik_value",
            description: "Saldırılarınızın kritik vuruş yapma olasılığını artırır. Kritik vuruşlar normalden daha fazla hasar verir."
        }, {
            icon: "🗡️",
            label: "Savaşçılara Karşı Güçlü",
            getValue: () => window.sav_guc_value,
            format: "%",
            increment: 10,
            windowRef: "sav_guc_value",
            description: "Savaşçı sınıfı oyunculara karşı verdiğiniz hasarı artırır."
        }, {
            icon: "🔮",
            label: "Suralara Karşı Güçlü",
            getValue: () => window.sur_guc_value,
            format: "%",
            increment: 10,
            windowRef: "sur_guc_value",
            description: "Sura sınıfı oyunculara karşı verdiğiniz hasarı artırır."
        }, {
            icon: "🛡️",
            label: "Savaşçılara Karşı Savunma",
            getValue: () => window.sav_sav_value,
            format: "%",
            increment: 10,
            windowRef: "sav_sav_value",
            description: "Savaşçı sınıfı oyuncuların saldırılarından aldığınız hasarı azaltır."
        }, {
            icon: "🛡️",
            label: "Suralara Karşı Savunma",
            getValue: () => window.sur_sav_value,
            format: "%",
            increment: 10,
            windowRef: "sur_sav_value",
            description: "Sura sınıfı oyuncuların saldırılarından aldığınız hasarı azaltır."
        }, {
            icon: "📈",
            label: "Ortalama Zarar",
            getValue: () => window.ort_zarar_value,
            format: "%",
            increment: 10,
            windowRef: "ort_zarar_value",
            description: "Normal saldırılarınızın ve bazı becerilerinizin ortalama hasarını artırır."
        }, {
            icon: "🔥",
            label: "Beceri Hasarı",
            getValue: () => window.bec_hasari_value,
            format: "%",
            increment: 10,
            windowRef: "bec_hasari_value",
            description: "Becerilerinizin verdiği hasarı artırır. Becerilere dayalı karakterler için önemlidir."
        }],
        ortak: [{
            icon: "💪",
            label: "Güç",
            getValue: () => window.guc_value,
            format: "",
            increment: 12,
            windowRef: "guc_value",
            description: "Karakterinizin temel saldırı gücünü ve bazı becerilerin hasarını artırır."
        }, {
            icon: "🧠",
            label: "Zeka",
            getValue: () => window.zeka_value,
            format: "",
            increment: 12,
            windowRef: "zeka_value",
            description: "Büyücü karakterlerin büyü hasarını ve mana miktarını artırır. Diğer karakterler için de bazı faydaları olabilir."
        }, {
            icon: "🎯",
            label: "Kritik Vuruş Şansı",
            getValue: () => window.kritik_value,
            format: "%",
            increment: 100,
            windowRef: "kritik_value",
            description: "Saldırılarınızın kritik vuruş yapma olasılığını artırır. Kritik vuruşlar normalden daha fazla hasar verir."
        }, {
            icon: "📈",
            label: "Ortalama Zarar",
            getValue: () => window.ort_zarar_value,
            format: "%",
            increment: 10,
            windowRef: "ort_zarar_value",
            description: "Normal saldırılarınızın ve bazı becerilerinizin ortalama hasarını artırır."
        }]
    };
    var r = document.createElement("div");
    r.id = "bonus-window", r.innerHTML = '\n        <div class="header">\n            <span>Bonus Bilgisi - <span id="active-tab-name">PvP</span></span>\n            <button class="close-btn">×</button>\n        </div>\n\n        <div id="bonus-content" class="bonus-content">\n            \x3c!-- Bonuslar buraya JavaScript ile yüklenecek --\x3e\n        </div>\n\n        <div class="bottom-buttons">\n            <button>I</button>\n            <button>II</button>\n        </div>\n\n        <div class="tab-bar">\n            \x3c!-- Sekme butonları buraya JavaScript ile yüklenecek --\x3e\n        </div>\n    ', document.body.appendChild(r), console.log("Bonus penceresi DOM'a eklendi.");
    var i = document.createElement("div");
    i.id = "bonus-explanation-modal", i.className = "modal-overlay", i.innerHTML = '\n        <div class="modal-content">\n            <div class="modal-header">\n                <span class="modal-title">Bonus Açıklaması</span>\n                <button class="modal-close-btn">×</button>\n            </div>\n            <div class="modal-body">\n                \x3c!-- Açıklama buraya yüklenecek --\x3e\n            </div>\n        </div>\n    ', document.body.appendChild(i), console.log("Modal DOM'a eklendi.");
    const o = r.querySelector(".header .close-btn"),
        t = document.getElementById("bonus-content"),
        l = r.querySelector(".tab-bar"),
        d = document.getElementById("active-tab-name"),
        s = i.querySelector(".modal-close-btn"),
        u = i.querySelector(".modal-body"),
        c = i.querySelector(".modal-title");
    console.log("Element referansları alındı."), o.onclick = function() {
        r.style.display = "none"
    }, s.onclick = function() {
        i.style.display = "none"
    }, i.onclick = function(n) {
        n.target === i && (i.style.display = "none")
    }, console.log("Olay dinleyicileri atandı."), window.showBonusWindow = function(n) {
        if (r.style.display = n ? "block" : "none", n) {
            const n = l.querySelector(".tab-bar button.active");
            n && renderBonusContent(n.dataset.tab)
        }
        console.log("Pencere görünürlüğü değiştirildi: " + (n ? "görünür" : "gizli"))
    };

    function renderBonusContent(a) {
        t.innerHTML = "", d.textContent = "ortak" === a ? "Ortak" : a.toUpperCase();
        (n.BONUS_DATA[a] || []).forEach((function(n) {
            var a = document.createElement("div");
            a.className = "bonus-item";
            var e = document.createElement("span");
            e.innerText = n.label, e.className = "bonus-label", a.appendChild(e);
            var r = document.createElement("div");
            r.className = "value-box";
            var o = document.createElement("span");
            o.innerText = n.icon, o.className = "bonus-icon", r.appendChild(o);
            var l = document.createElement("span");
            const d = n.getValue(),
                s = d >= 0 && "" !== n.format ? "+" + d + n.format : d + n.format;
            l.innerText = s, l.className = "bonus-value", r.appendChild(l);
            var b = document.createElement("span");
            b.innerText = " ✨ℹ️", b.className = "info-icon", b.title = `${n.label} hakkında bilgi al`, b.onclick = a => {
                a.stopPropagation(),
                    function showBonusExplanation(n, a) {
                        c.textContent = `${n} Açıklaması`, u.textContent = a, i.style.display = "flex", console.log(`Modal açıldı: ${n}`)
                    }(n.label, n.description)
            }, r.appendChild(b), a.appendChild(r), t.appendChild(a)
        })), console.log(`Bonus içeriği '${a}' için render edildi.`)
    } [{
        name: "PvP",
        key: "pvp"
    }, {
        name: "PvM",
        key: "pvm"
    }, {
        name: "Ortak",
        key: "ortak"
    }].forEach((function(n) {
        var a = document.createElement("button");
        a.innerText = n.name, a.dataset.tab = n.key, "pvp" === n.key && a.classList.add("active"), a.onclick = function() {
            l.querySelectorAll("button").forEach((function(n) {
                n.classList.remove("active")
            })), a.classList.add("active"), renderBonusContent(n.key)
        }, l.appendChild(a)
    })), console.log("Sekme butonları oluşturuldu."), n.app.keyboard.on(pc.EVENT_KEYDOWN, (function(n) {
        const e = Date.now();
        if (console.log(`Tuş basıldı: ${n.key}, pc.KEY_B: ${pc.KEY_B}, Geçen süre: ${e-a}ms`), n.key === pc.KEY_B && e - a > 200) {
            const n = document.getElementById("bonus-window");
            n ? ("none" === n.style.display || "" === n.style.display ? window.showBonusWindow(!0) : window.showBonusWindow(!1), a = e) : console.warn("Bonus penceresi bulunamadı. DOM'a eklenmemiş olabilir.")
        }
    }), n), renderBonusContent("pvp"), console.log("Başlangıç içeriği render edildi (PvP)."), n.app.fire("bonusWindowUI:ready", this)
}, BonusWindowUI.prototype.update = function(n) {};
var MetinStoneBonusChooser = pc.createScript("metinStoneBonusChooser");
MetinStoneBonusChooser.prototype.initialize = function() {
    var n = this;
    console.log("MetinStoneBonusChooser script initialize edildi.");
    var e = document.createElement("style");
    e.textContent = "\n        /* Ana seçim container'ı */\n        #bonus-options-container {\n            position: fixed; /* Ekranın belirli bir yerinde kalmasını sağlar */\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%); /* Merkezi konumlandırma */\n            display: flex;\n            flex-wrap: wrap; /* Küçük ekranlarda alt alta geçiş */\n            justify-content: center;\n            gap: 40px; /* Seçenekler arası boşluk */\n            z-index: 10002;\n            display: none; /* Başlangıçta gizli */\n            pointer-events: none; /* Etkileşimi engelle, sadece gösterim için */\n            opacity: 0; /* Başlangıçta şeffaf, animasyon için */\n            transition: opacity 0.3s ease-in-out; /* Görünürlük geçişi */\n        }\n\n        #bonus-options-container.active {\n            opacity: 1;\n            pointer-events: auto; /* Aktifken etkileşime izin ver */\n        }\n\n        .bonus-option {\n            background: rgba(18, 25, 34, 0.95); /* Metin2 panel teması */\n            border: 2px solid #5a4b3d; /* Kahverengi/bronz kenarlık */\n            border-radius: 8px;\n            padding: 25px;\n            width: 90%;\n            max-width: 380px; /* Genişletilmiş boyut */\n            box-shadow: 0 10px 30px rgba(0,0,0,0.9);\n            color: #e0e0e0;\n            text-align: center;\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            cursor: pointer;\n            transition: all 0.2s ease;\n        }\n\n        .bonus-option:hover {\n            transform: translateY(-5px);\n            box-shadow: 0 6px 16px rgba(0,0,0,0.8), 0 0 15px rgba(255,215,0,0.4); /* Hafif parlama */\n            border-color: #ffd700;\n        }\n\n        .bonus-option h3 {\n            font-size: 1.6em;\n            color: #fbd38d; /* Altın sarısı bonus adı */\n            margin-bottom: 10px;\n            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);\n        }\n\n        .bonus-option .bonus-details {\n            font-size: 1.2em;\n            color: #c0c0c0;\n            margin-bottom: 15px;\n            line-height: 1.4;\n        }\n        .bonus-option .bonus-details strong {\n            color: #f0e68c; /* Soluk altın sarısı değer */\n        }\n\n        .bonus-option .bonus-description {\n            font-size: 1em;\n            color: #a0a0a0;\n            margin-top: 10px;\n            font-style: italic;\n        }\n\n        .choose-button {\n            background: linear-gradient(to bottom, #ffd700 0%, #ccaa00 100%); /* Altın gradyan buton */\n            border: 1px solid #ffea00;\n            color: #302000;\n            font-size: 1.2em;\n            font-weight: bold;\n            padding: 12px 30px;\n            border-radius: 5px;\n            cursor: pointer;\n            box-shadow: 0 3px 8px rgba(0,0,0,0.6);\n            transition: all 0.2s ease;\n            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);\n            margin-top: 20px;\n        }\n        .choose-button:hover {\n            background: linear-gradient(to bottom, #ffea00 0%, #ddbb00 100%);\n            transform: translateY(-2px);\n            box-shadow: 0 5px 10px rgba(0,0,0,0.8);\n        }\n        .choose-button:active {\n            transform: translateY(0);\n            box-shadow: inset 0 1px 3px rgba(0,0,0,0.6);\n        }\n\n        /* Seçilen bonusun sol altta görünmesi */\n        #selected-bonus-display {\n            position: fixed;\n            bottom: 20px;\n            left: 20px;\n            background: rgba(0, 0, 0, 0.7); /* Hafif şeffaf arka plan */\n            color: #7FFF00; /* Parlak yeşil */\n            font-size: 1.6em;\n            font-weight: bold;\n            padding: 10px 20px;\n            border-radius: 8px;\n            border: 1px solid #32CD32; /* LimeGreen kenarlık */\n            box-shadow: 0 0 15px rgba(127,255,0,0.7);\n            z-index: 10001;\n            opacity: 0; /* Başlangıçta gizli */\n            transition: opacity 1s ease-out; /* Yumuşak silinme animasyonu */\n            pointer-events: none; /* Tıklama olaylarını engelle */\n        }\n\n        /* Responsive ayarlar */\n        @media (max-width: 768px) {\n            #bonus-options-container {\n                flex-direction: column; /* Küçük ekranlarda alt alta */\n                gap: 20px;\n            }\n            .bonus-option {\n                min-width: unset;\n                width: 90%; /* Tam genişlik */\n                max-width: 95%;\n                padding: 15px;\n            }\n            .bonus-option h3 {\n                font-size: 1.4em;\n            }\n            .bonus-option .bonus-details {\n                font-size: 1.1em;\n            }\n            .choose-button {\n                font-size: 1.1em;\n                padding: 10px 25px;\n            }\n            #selected-bonus-display {\n                font-size: 1.3em;\n                bottom: 10px;\n                left: 10px;\n                padding: 8px 15px;\n            }\n        }\n    ", document.head.appendChild(e);
    var o = document.createElement("div");
    o.id = "bonus-options-container", document.body.appendChild(o);
    var t = document.createElement("div");
    t.id = "selected-bonus-display", document.body.appendChild(t);
    document.getElementById("selection-result");
    let a = null;

    function getRandomBonus(n) {
        if (!a || !a.BONUS_DATA || !a.BONUS_DATA[n]) return console.error("BONUS_DATA bulunamadı veya geçersiz tür:", n), null;
        const e = a.BONUS_DATA[n];
        return e[Math.floor(Math.random() * e.length)]
    }
    n.app.on("bonusWindowUI:ready", (n => {
        a = n, console.log("BonusWindowUI script referansı alındı.")
    })), n.showBonusChooser = function() {
        console.log("Bonus seçici gösteriliyor..."), o.innerHTML = "", o.classList.add("active"), o.style.display = "flex";
        const e = getRandomBonus("pvm"),
            t = getRandomBonus("pvp");
        if (!e || !t) return console.error("Bonuslar rastgele seçilemedi. Veri hatası olabilir."), o.classList.remove("active"), void setTimeout((() => {
            o.style.display = "none"
        }), 300);
        [e, t].forEach((e => {
            const t = document.createElement("div");
            t.className = "bonus-option";
            const a = e.getValue() >= 0 && "" !== e.format ? "+" + e.getValue() + e.format : e.getValue() + e.format;
            t.innerHTML = `\n                <h3>${e.icon} ${e.label}</h3>\n                <div class="bonus-details">\n                    Mevcut Değer: <strong>${a}</strong><br>\n                    <p class="bonus-description">${e.description}</p>\n                </div>\n                <button class="choose-button">Bu Bonusu Seç</button>\n            `, o.appendChild(t), t.querySelector(".choose-button").onclick = () => {
                n.chooseBonus(e)
            }
        }))
    }, n.chooseBonus = function(n) {
        o.classList.remove("active"), setTimeout((() => {
            o.style.display = "none"
        }), 300);
        const e = n.increment,
            a = n.windowRef;
        void 0 !== window[a] ? (window[a] = (window[a] || 0) + e, console.log(`${n.label} güncellendi: Yeni değer ${window[a]}`)) : console.warn(`"${n.label}" için window değişkeni bulunamadı: ${a}`);
        const i = n.getValue() >= 0 && "" !== n.format ? "+" + n.getValue() + n.format : n.getValue() + n.format;
        t.textContent = `Seçiminiz: ${n.label}! Yeni değer: ${i}`, t.style.opacity = "1", setTimeout((() => {
            t.style.opacity = "0", setTimeout((() => {
                t.style.display = "none"
            }), 1e3)
        }), 3e3)
    }
}, MetinStoneBonusChooser.prototype.update = function(n) {};
var ModelChanger = pc.createScript("modelChanger");
ModelChanger.attributes.add("characterEntity", {
    type: "entity",
    title: "savasciCharacter"
}), ModelChanger.attributes.add("mainObje1", {
    type: "entity"
}), ModelChanger.attributes.add("etObje1", {
    type: "entity"
}), ModelChanger.attributes.add("etObje2", {
    type: "entity"
}), ModelChanger.attributes.add("etObje3", {
    type: "entity"
}), ModelChanger.attributes.add("bodyMain", {
    type: "entity",
    title: "warrior_body02_0"
}), ModelChanger.attributes.add("bodyEt", {
    type: "entity",
    title: "e_t_body"
}), ModelChanger.attributes.add("bodySummer1", {
    type: "entity",
    title: "warrior_summer_2019_body_1"
}), ModelChanger.attributes.add("bodySummer2", {
    type: "entity",
    title: "warrior_summer_2019_body_2"
}), ModelChanger.attributes.add("materialMainZirh", {
    type: "asset",
    assetType: "material"
}), ModelChanger.attributes.add("materialEtZirh", {
    type: "asset",
    assetType: "material"
}), ModelChanger.prototype.changeModel = function(e) {
    this.bodyMain.enabled = !1, this.bodyEt.enabled = !1, this.bodySummer1.enabled = !1, this.bodySummer2.enabled = !1, this.mainObje1.enabled = !1, this.etObje1.enabled = !1, this.etObje2.enabled = !1, this.etObje3.enabled = !1, 0 === e ? (this.bodyMain.enabled = !0, this.mainObje1.enabled = !0, this.bodyMain.model && this.materialMainZirh && (this.bodyMain.model.material = this.materialMainZirh.resource)) : 1 === e ? (this.bodyEt.enabled = !0, this.etObje1.enabled = !0, this.etObje2.enabled = !0, this.etObje3.enabled = !0, this.bodyEt.model && this.materialEtZirh && (this.bodyEt.model.material = this.materialEtZirh.resource)) : 2 === e && (this.bodySummer1.enabled = !0, this.bodySummer2.enabled = !0)
}, ModelChanger.prototype.initialize = function() {
    var e = this;
    this.app.keyboard.on(pc.EVENT_KEYDOWN, (function(t) {
        t.key === pc.KEY_1 ? e.changeModel(0) : t.key === pc.KEY_2 ? e.changeModel(1) : t.key === pc.KEY_3 && e.changeModel(2)
    }), this)
};