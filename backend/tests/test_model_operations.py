from backend.src.models.model_operations import remove_background

def test_remove_background(input_image_fpath, output_image_fpath):
    with open(input_image_fpath, 'rb') as f:
        input_image_bytes = f.read()
    output_image_bytes = remove_background(input_image_bytes)
    with open(output_image_fpath, 'wb') as f:
        f.write(output_image_bytes)
    print(f'output image written, see: {output_image_fpath}')

if __name__ == "__main__":
    input_image_fpath = r"/Users/pongyizhen/Library/CloudStorage/OneDrive-NationalUniversityofSingapore/Y3S2_Summer_TiktokTechJam/test/SHEIN MOD Ladies' Fashionable Asymmetrical Strap Ruffle Top, Light Yellow, Ideal For Summer Vacation.png"
    output_image_fpath = r"/Users/pongyizhen/Library/CloudStorage/OneDrive-NationalUniversityofSingapore/Y3S2_Summer_TiktokTechJam/test/SHEIN MOD Ladies' Fashionable Asymmetrical Strap Ruffle Top, Light Yellow, Ideal For Summer Vacation output.png"
    test_remove_background(input_image_fpath, output_image_fpath)