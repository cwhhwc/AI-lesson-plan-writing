<template>
  <view class="section-view" id="features">
    <view class="container">
      <view class="section-title">
        <text class="section-h2">智能备课解决方案</text>
        <text class="section-p">我们提供全面的AI教学工具，让您专注于教学本身，而非繁琐的准备工作</text>
      </view>
      <view class="features">
        <view class="feature-card">
          <view class="feature-icon">
            <!-- 1. AI写教案图标 -->
            <view class="icon-common icon-lesson-plan"></view>
          </view>
          <text class="feature-h3">AI写教案</text>
          <text class="feature-p">只需输入课程主题和教学目标，AI即可快速生成结构完整、内容丰富的专业教案，支持多种教学风格和难度级别。</text>
        </view>
        <view class="feature-card coming-soon">
          <view class="feature-icon">
            <!-- 2. AI制作PPT图标 -->
            <view class="icon-common icon-ppt"></view>
          </view>
          <text class="feature-h3">AI制作教学PPT</text>
          <text class="feature-p">根据教案内容一键生成精美的教学演示文稿，自动匹配相关图片和图表，节省设计时间。（即将推出）</text>
        </view>
        <view class="feature-card coming-soon">
          <view class="feature-icon">
            <!-- 3. 智能搜集资料图标 -->
            <view class="icon-common icon-resources"></view>
          </view>
          <text class="feature-h3">智能搜集教学资料</text>
          <text class="feature-p">从海量教育资源中智能筛选最适合的教学素材，包括视频、案例、练习题等，丰富您的课堂内容。（即将推出）</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// This component is purely presentational.
</script>

<style scoped>
/* Common styles copied from parent */
.container {
  width: 100%;
  max-width: 2400rpx;
  margin: 0 auto;
  padding: 0 40rpx;
}

.section-view {
  padding: 200rpx 0;
}

.section-title {
  text-align: center;
  margin-bottom: 120rpx;
}

.section-h2 {
  display: block;
  font-size: 80rpx; /* 2.5rem */
  color: #2c3e50;
  margin-bottom: 40rpx;
}

.section-p {
  display: block;
  color: #7f8c8d;
  max-width: 1200rpx;
  margin: 0 auto;
}

/* Component-specific styles */
.features {
  display: flex;
  flex-wrap: wrap;
  gap: 60rpx;
}

.feature-card {
  flex: 1;
  min-width: 600rpx;
  background: white;
  padding: 80rpx 60rpx;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-20rpx);
  box-shadow: 0 30rpx 60rpx rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 140rpx;
  height: 140rpx;
  background: #e6f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50rpx;
}

.feature-icon-img {
  width: 70rpx;
  height: 70rpx;
}

.icon-common {
  width: 80rpx;
  height: 80rpx;
}


.icon-ppt {
  background: url('data:image/svg+xml;utf8,<svg t="1756909350943" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14442" width="200" height="200"><path d="M341.333333 426.666667a42.666667 42.666667 0 0 1 42.666667-42.666667h181.333333a117.333333 117.333333 0 1 1 0 234.666667H469.333333v-85.333334h96a32 32 0 0 0 0-64H426.666667v213.333334h-85.333334V426.666667z" fill="%230078FF" p-id="14443"></path><path d="M149.333333 128a42.666667 42.666667 0 0 1 42.666667-42.666667h469.333333a42.666667 42.666667 0 0 1 30.165334 12.501334l170.666666 170.666666A42.666667 42.666667 0 0 1 874.666667 298.666667v597.333333a42.666667 42.666667 0 0 1-42.666667 42.666667H192a42.666667 42.666667 0 0 1-42.666667-42.666667V128z m85.333334 42.666667v682.666666h554.666666V316.330667L643.669333 170.666667H234.666667z" fill="%23000000" p-id="14444"></path></svg>') no-repeat center/contain;
}

.icon-resources {
  background: url('data:image/svg+xml;utf8,<svg t="1756909548710" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15872" width="200" height="200"><path d="M652.5952 134.7584v137.728a23.9616 23.9616 0 0 0 24.0128 23.9616h137.0624l-161.0752-161.6896z m195.4304 209.92h-171.4176a72.0384 72.0384 0 0 1-72.0384-71.9872V112.0256h-404.48a23.9104 23.9104 0 0 0-23.9616 23.9616v752.0256a24.0128 24.0128 0 0 0 23.9616 24.0128h623.9232a24.064 24.064 0 0 0 24.0128-24.0128zM199.9872 64H640a24.0128 24.0128 0 0 1 16.9984 7.0656l232.0896 233.0112A23.9616 23.9616 0 0 1 896 321.024v566.9888a72.0384 72.0384 0 0 1-71.9872 71.9872H199.9872A72.0384 72.0384 0 0 1 128 888.0128V135.9872A72.0384 72.0384 0 0 1 199.9872 64z" fill="%23000000" p-id="15873" data-spm-anchor-id="a313x.search_index.0.i23.22ad3a81mgkvaS" class="selected"></path><path d="M536.0128 768h-256a24.0128 24.0128 0 0 0 0 48.0256h256a24.0128 24.0128 0 0 0 0-48.0256z m79.9744-1.9968a24.0128 24.0128 0 1 0 24.0128 24.0128 23.9616 23.9616 0 0 0-24.0128-24.0128z m-335.9744-205.9776h335.9744a24.0128 24.0128 0 0 0 0-48.0256H280.0128a24.0128 24.0128 0 0 0 0 48.0256zM615.9872 640H280.0128a24.0128 24.0128 0 0 0 0 48.0256h335.9744a24.0128 24.0128 0 0 0 0-48.0256z" fill="%231296db" p-id="15874" data-spm-anchor-id="a313x.search_index.0.i22.22ad3a81mgkvaS" class=""></path></svg>') no-repeat center/contain;
}

.icon-lesson-plan {
  background: url('data:image/svg+xml;utf8,<svg t="1756977058783" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2442" width="200" height="200"><path d="M303.590073 286.694337l160.722169-61.143531a31.396492 31.396492 0 0 1 33.344553 7.138152l168.542853 168.557073c8.744947 8.730727 11.517735 21.78416 7.152371 33.330333l-61.14353 160.736389a31.382273 31.382273 0 0 1-21.940574 19.338419l-353.921507 85.800015c-22.836398 5.517137-43.426126-15.072591-37.894769-37.89477l85.800015-353.921506a31.353834 31.353834 0 0 1 19.338419-21.954794" fill="%2369BBFF" p-id="2443"></path><path d="M231.426487 247.619355l0.49768-2.559497a3.042957 3.042957 0 0 1 0.98114-1.791647L483.565344 147.912742l2.801227-1.23709a18.627448 18.627448 0 0 1 21.641966 3.441101l240.791755 240.777536c5.716209 5.730429 7.095493 14.418498 3.412662 21.641966L655.620395 666.011738a2.943421 2.943421 0 0 1-1.777428 0.966921L150.119811 788.981331l234.563647-234.563646c31.282737 14.688667 69.58987 9.441699 95.412346-16.380779a84.321195 84.321195 0 0 0-119.229885-119.258324c-25.850916 25.836697-31.097884 64.158049-16.394997 95.426567L109.949933 748.726137l121.476554-501.092563z m743.363139 667.0617c-92.468926-155.233471-371.837983-21.897916-393.309316-11.347102-167.817663 69.717844-303.015962 82.230939-391.119525 36.117342a190.1706 190.1706 0 0 1-81.775917-81.889673l555.055284-134.544207a59.949099 59.949099 0 0 0 43.07064-31.808855L803.644617 436.851473a75.320298 75.320298 0 0 0-14.646008-86.155501L548.235292 109.889997a75.334518 75.334518 0 0 0-86.127061-14.646008l-251.626958 95.710954-2.787008 1.23709a59.863782 59.863782 0 0 0-31.780416 43.08486L36.876304 808.717894a43.682076 43.682076 0 0 0 3.896123 30.71396c5.403382 20.618167 31.794636 101.882185 121.903137 149.730553 43.767392 23.220322 95.028422 34.837593 153.51292 34.837593 82.046086 0 178.354257-22.879056 288.000249-68.509193 0.597216-0.24173 1.180212-0.511899 1.748989-0.796288 2.531058-1.265529 253.617677-122.32972 320.008176-10.9063a28.410413 28.410413 0 0 0 38.961227 9.868282 28.410413 28.410413 0 0 0 9.882501-38.961227z m-124.476853-596.234741c5.559795 5.545576 12.825922 8.318364 20.106268 8.318365a28.438851 28.438851 0 0 0 20.106268-48.54512L620.669047 8.349078a28.438851 28.438851 0 0 0-40.226755 40.226755l269.8847 269.870481z" fill="%23333C4F" p-id="2444"></path></svg>') no-repeat center/contain;
}

.feature-h3 {
  display: block;
  font-size: 48rpx; /* 1.5rem */
  margin-bottom: 30rpx;
  color: #2c3e50;
}

.feature-p {
  display: block;
  color: #7f8c8d;
}

.coming-soon {
  opacity: 0.8;
  position: relative;
}

.coming-soon::after {
  content: '即将推出';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  background: #3498db;
  color: white;
  font-size: 22rpx; /* 0.7rem */
  padding: 6rpx 20rpx;
  border-radius: 40rpx;
}
</style>