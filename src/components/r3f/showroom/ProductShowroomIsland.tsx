import { useState } from 'react';
import { showroomModels } from '../../../data/showroomModels';
import { SceneCanvas } from './SceneCanvas';
import styles from './ProductShowroomIsland.module.css';

export default function ProductShowroomIsland() {
  // 当前展示到第几个模型
  const [index, setIndex] = useState(0);

  // 用于“复位视角”，每次点击就让值 +1，触发场景内的重新聚焦
  const [focusVersion, setFocusVersion] = useState(0);

  const currentModel = showroomModels[index];
  const total = showroomModels.length;

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + total) % total);
  };

  const goNext = () => {
    setIndex((prev) => (prev + 1) % total);
  };

  const refocus = () => {
    setFocusVersion((prev) => prev + 1);
  };

  return (
    <section className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>{currentModel.name}</h3>
          <p className={styles.infoMeta}>
            当前模型尺寸特征：{currentModel.sizeHint}
            <br />
            {currentModel.summary}
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} onClick={goPrev} type="button">
            上一个模型
          </button>

          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={goNext}
            type="button"
          >
            下一个模型
          </button>

          <button className={styles.button} onClick={refocus} type="button">
            复位视角
          </button>
        </div>
      </div>

      <div className={styles.canvasCard}>
        <div className={styles.canvasBox}>
          <SceneCanvas model={currentModel} focusVersion={focusVersion} />
        </div>
      </div>

      <p className={styles.tip}>
        操作方式：左键旋转，滚轮缩放，右键拖拽平移。切换模型后，相机会自动重新框住当前模型。
      </p>
    </section>
  );
}