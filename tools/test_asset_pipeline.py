import unittest
from pathlib import Path
import tempfile
from PIL import Image
from audit_fish_assets import analyze_file, choose_downsample, alpha_bbox

class AssetAuditTests(unittest.TestCase):
    def setUp(self):
        self.profile = dict(fishId="fish_sample",sourceId="fish_sample",sizeClass="XL",
                            priority="high",minSourceEdge=512,preferredSourceEdge=1024,
                            maxRecommendedEdge=1536,minEffectiveDensity=1.35,maxDisplayWidth=300)
    def test_downsampling_oversized_image_preserves_density(self):
        self.assertEqual(choose_downsample(2048,2048,(250,250,1800,1800),self.profile),(1024,1024))
    def test_padded_image_is_not_destroyed_by_shrinking(self):
        self.assertIsNone(choose_downsample(2048,2048,(900,900,1150,1150),self.profile))
    def test_low_res_is_not_upscaled(self):
        self.assertIsNone(choose_downsample(256,256,(0,0,256,256),self.profile))
    def test_analysis_preserves_original_in_read_only_mode(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"fish_sample.png"
            img=Image.new("RGBA",(256,256),(0,0,0,0))
            img.paste((100,140,180,255),(20,20,230,220))
            img.save(path)
            data=path.read_bytes()
            result=analyze_file(path,self.profile,apply=False)
            self.assertEqual(data,path.read_bytes())
            self.assertIn("SMALL_SOURCE_REVIEW",result["warnings"])
            self.assertEqual(result["action"],"unchanged")
    def test_small_source_is_still_not_upscaled_in_apply_mode(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"fish_sample.png"
            Image.new("RGBA",(256,256),(100,140,180,255)).save(path)
            result=analyze_file(path,self.profile,apply=True)
            self.assertEqual(result["finalSize"],[256,256])
    def test_rgba_bbox_excludes_transparent_padding(self):
        img=Image.new("RGBA",(100,100),(0,0,0,0))
        img.paste((0,0,0,255),(20,30,80,70))
        self.assertEqual(alpha_bbox(img),(20,30,80,70))

if __name__ == "__main__":
    unittest.main()
